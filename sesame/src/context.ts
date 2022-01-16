import { PrismaClient } from '@prisma/client'
import { Enforcer, newEnforcer } from 'casbin'
import { cognitoUserService, UserService } from './userService'
import { PrismaAdapter } from 'casbin-prisma-adapter'
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'

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
  userService: UserService
  enforcer: Enforcer
}

export const integratedContext = async (env: NodeJS.ProcessEnv): Promise<Context> => ({
  db: new PrismaClient(),
  env,
  userService: cognitoUserService(new CognitoIdentityProviderClient({}), env.USER_POOL_ID),
  enforcer: await newEnforcer('casbin.conf', new PrismaAdapter(new PrismaClient()))
})