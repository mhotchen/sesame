import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AttributeType,
  CognitoIdentityProviderClient,
  CreateGroupCommand,
  GetGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider'

type ID = string

export type UserService = {
  createUser: (email: string, password: string) => Promise<ID>
  isValidGroup: (group: string) => Promise<boolean>
  createGroup: (group: string) => Promise<void>
  addUserToGroup: (email: string, group: string) => Promise<void>
}

export const newCognitoUserService = (cognito: CognitoIdentityProviderClient, poolId: string): UserService => ({
  createUser: (email: string, password: string) => {
    const attributes: AttributeType[] = [ { Name: "email", Value: email } ]
    const getId = (attrs: AttributeType[]): ID => attrs.find(attr => attr.Name === 'sub')?.Value
    const createUser = () => cognito.send(new AdminCreateUserCommand({
      UserPoolId: poolId,
      Username: email,
      TemporaryPassword: password,
      UserAttributes: attributes,
    }))
    const getUser = () => cognito.send(new AdminGetUserCommand({ UserPoolId: poolId, Username: email }))
    const updateUserAttributes = () => cognito.send(new AdminUpdateUserAttributesCommand({
      UserPoolId: poolId,
      Username: email,
      UserAttributes: attributes,
    }))
    const setPassword = () => cognito.send(new AdminSetUserPasswordCommand({
      UserPoolId: poolId,
      Username: email,
      Password: password,
      Permanent: true,
    }))

    return idempot(
      async () => {
        const createResult = await createUser()
        await setPassword()

        return getId(createResult.User.Attributes)
      },
      'UsernameExistsException',
      async () => {
        const [ user ] = await Promise.all([ getUser(), setPassword(), updateUserAttributes() ])

        return getId(user.UserAttributes)
      },
    )
  },

  isValidGroup: group => idempot(
    async () => {
      await cognito.send(new GetGroupCommand({
        UserPoolId: poolId,
        GroupName: group,
      }))

      return true
    },
    'ResourceNotFoundException',
    async () => false,
  ),

  createGroup: group => idempot(
    async () => {
      await cognito.send(new CreateGroupCommand({
        UserPoolId: poolId,
        GroupName: group
      }))
    },
    'GroupExistsException',
    async () => {},
  ),

  addUserToGroup: async (email: string, group: string) => {
    await cognito.send(new AdminAddUserToGroupCommand({
      UserPoolId: poolId,
      Username: email,
      GroupName: group
    }))
  },
})

const idempot = async <T>(happy: () => Promise<T>, acceptableError: string, sad: () => Promise<T>): Promise<T> => {
  try {
    return await happy()
  } catch (error) {
    if (error?.name === acceptableError) return await sad()

    throw error
  }
}
