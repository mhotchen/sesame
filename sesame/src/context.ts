import { PrismaClient } from '@prisma/client'
import { Enforcer, newEnforcer } from 'casbin'
import { cognitoUserManagementService, UserManagementService } from './userManagementService'
import { PrismaAdapter } from 'casbin-prisma-adapter'
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'
import { LoggedInUserService, loggedInUserService } from './loggedInUserService'
import { AppSyncIdentityCognito } from 'aws-lambda'

// If modified and the serverless.ts does not provide all values, a compilation error will be produced.
// Auto-completion of NodeJS.ProcessEnv includes these values
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string
      USER_POOL_ID: string
    }
  }
}

export type Context = {
  db: PrismaClient
  env: NodeJS.ProcessEnv
  userManagementService: UserManagementService
  loggedInUserService: LoggedInUserService
  enforcer: Enforcer
}

export const integratedContext = async (
  env: NodeJS.ProcessEnv,
  identity?: AppSyncIdentityCognito | undefined
): Promise<Context> => ({
  db: new PrismaClient(),
  env,
  loggedInUserService: loggedInUserService(identity === undefined ? undefined : {
    email: identity.username,
    sub: identity.sub,
    groups: identity.groups ?? []
  }),
  userManagementService: cognitoUserManagementService(new CognitoIdentityProviderClient({}), env.USER_POOL_ID),
  enforcer: await newEnforcer('casbin.conf', new PrismaAdapter(new PrismaClient()))
})