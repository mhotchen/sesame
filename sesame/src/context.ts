import { PrismaClient } from '@prisma/client'
import { Enforcer, newEnforcer } from 'casbin'
import { newCognitoUserService, UserService } from './userService'
import { PrismaAdapter } from 'casbin-prisma-adapter'
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'
import { ErrorResult, ErrorType } from './graph'

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

export type ResolverContext = {
  db: PrismaClient
  env: NodeJS.ProcessEnv
  userService: UserService
  enforcer: () => Promise<Enforcer>
}

export const createIntegratedContext = async (env: NodeJS.ProcessEnv): Promise<ResolverContext> => {
  const db = new PrismaClient()
  const userService = newCognitoUserService(new CognitoIdentityProviderClient({}), env.USER_POOL_ID)
  const enforcer = async () => await newEnforcer('casbin.conf', new PrismaAdapter(db))

  return { db, env, userService, enforcer }
}

export const createInternalError = (): ErrorResult => ({
  __typename: 'ErrorResult',
  type: ErrorType.InternalError,
  errorMessage: 'Internal error',
})