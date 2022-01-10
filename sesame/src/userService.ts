import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminConfirmSignUpCommand,
  AdminAddUserToGroupCommand,
  CreateGroupCommand,
  GetGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { randomBytes } from 'crypto'

type TemporaryPassword = string
export type UserService = {
  createUser: (email: string) => Promise<TemporaryPassword>
  groupsExist: (groups: readonly string[]) => Promise<{ group: string, exists: boolean }[]>
  createGroup: (group: string) => Promise<void>
  addUserToGroup: (email: string, group: string) => Promise<void>
}

export const newCognitoUserService = (cognito: CognitoIdentityProviderClient, poolId: string): UserService => ({
  createUser: async (email: string) => {
    const temporaryPassword = randomBytes(64).toString('hex')
    console.log(temporaryPassword)
    await cognito.send(new AdminCreateUserCommand({
      UserPoolId: poolId,
      Username: email,
      TemporaryPassword: temporaryPassword,
      UserAttributes: [ { Name: "email", Value: email } ]
    }))
    await cognito.send(new AdminConfirmSignUpCommand({
      UserPoolId: poolId,
      Username: email
    }))

    return temporaryPassword
  },
  groupsExist: async (groups: readonly string[]) => Promise.all(groups.map(async group => {
    try {
      await cognito.send(new GetGroupCommand({
        UserPoolId: poolId,
        GroupName: group,
      }))

      return { group, exists: true }
    } catch (error) {
      if (error?.name === 'ResourceNotFoundException') {
        return { group, exists: false }
      }

      throw error
    }
  })),
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