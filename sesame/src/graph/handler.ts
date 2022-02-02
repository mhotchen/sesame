import { AppSyncIdentity, AppSyncIdentityCognito, AppSyncResolverHandler } from 'aws-lambda'
import {  Args, Response, Parent, FieldName, Fn } from './types'
import { resolvers, internalError } from './resolvers'
import { integratedContext } from '../context'
import { exception, logAny } from '../utils'
import { getHandlerName } from '../serverless/config'

// a bit of type coercion using 'as' keyword in this file

const name = 'graphqlHandler' // must match export const name for serverless.ts config
export const  graphqlHandler: AppSyncResolverHandler<Args, Response> = async event => {
  const type = event.info.parentTypeName as Parent
  const field = event.info.fieldName as FieldName
  const resolver = resolvers[type][field] as Fn

  type Result = { response: Response, error?: Error }
  const { response, error }: Result = await exception(
    async () => ({ response: await resolver(
      {},
      event.arguments,
      await integratedContext(
        process.env,
        isCognitoIdentity(event.identity) ? event.identity : undefined
      )
    )}),
    async error => ({ response: internalError(), error })
  )

  console.log(
    type,
    field,
    logAny(event.arguments),
    logAny(response),
    error,
    event,
  )

  return response
}

export const graphqlHandlerConfig = (rootDir: string) => ({
  handler: { [name]: { handler: getHandlerName(rootDir, __filename, name) } },
  dataSources: [ { type: 'AWS_LAMBDA', name, config: { functionName: name } } ],
  mappingTemplates: fields.map(({ type, field }) => ({
    dataSource: name,
    type,
    field,
    request: false,
    response: false
  })),
})

const isCognitoIdentity = (identity: AppSyncIdentity): identity is AppSyncIdentityCognito =>
  identity !== null && identity !== undefined && Object.keys(identity).includes('sub')
const fields = Object.keys(resolvers).flatMap(type => Object.keys(resolvers[type as Parent]).map(field =>
  ({ type, field })
))