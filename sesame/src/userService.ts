import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
  CreateGroupCommand,
  GetGroupCommand,
  AdminSetUserPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider'

type ID = string

export type UserService = {
  createUser: (email: string, password: string) => Promise<ID>
  isValidGroup: (group: string) => Promise<boolean>
  createGroup: (group: string) => Promise<void>
  addUserToGroup: (email: string, group: string) => Promise<void>
}

export const newCognitoUserService = (cognito: CognitoIdentityProviderClient, poolId: string): UserService => ({
  createUser: async (email: string, password: string) => {
    console.log(email, password)

    const createResult = await cognito.send(new AdminCreateUserCommand({
      UserPoolId: poolId,
      Username: email,
      TemporaryPassword: password,
      UserAttributes: [ { Name: "email", Value: email } ],
    }))
    await cognito.send(new AdminSetUserPasswordCommand({
      UserPoolId: poolId,
      Username: email,
      Password: password,
      Permanent: true,
    }))

    return createResult.User.Attributes.find(attr => attr.Name === 'sub').Value
  },

  isValidGroup: async group => {
    try {
      await cognito.send(new GetGroupCommand({
        UserPoolId: poolId,
        GroupName: group,
      }))

      return true
    } catch (error) {
      if (error?.name === 'ResourceNotFoundException') {
        return false
      }

      throw error
    }
  },

  createGroup: async (group: string) => {
    try {
      await cognito.send(new CreateGroupCommand({
        UserPoolId: poolId,
        GroupName: group
      }))
    } catch (error) {
      if (error?.name === 'GroupExistsException') {
        return
      }

      throw error
    }
  },

  addUserToGroup: async (email: string, group: string) => {
    await cognito.send(new AdminAddUserToGroupCommand({
      UserPoolId: poolId,
      Username: email,
      GroupName: group
    }))
  },
})