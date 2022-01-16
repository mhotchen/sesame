import { AppSyncResolverHandler } from 'aws-lambda'
import {  Args, Response, Parent, FieldName, Fn } from './graph/types'
import { resolvers, internalError } from './resolvers'
import { integratedContext } from './context'
import { exception, logAny } from './utils'

// a bit of type coercion using 'as' keyword in this file

const name = 'graphqlHandler' // must match export const name for serverless.ts config
export const  graphqlHandler: AppSyncResolverHandler<Args, Response> = async event => {
  const type = event.info.parentTypeName as Parent
  const field = event.info.fieldName as FieldName
  const resolver = resolvers[type][field] as Fn

  type Result = { response: Response, error?: Error }
  const { response, error }: Result = await exception(
    async () => ({ response: await resolver({}, event.arguments, await integratedContext(process.env)) }),
    async error => ({ response: internalError(), error })
  )

  console.log(
    type,
    field,
    logAny(event.arguments),
    logAny(response),
    error,
  )

  return response
}

export const getConfig = (rootDir: string) => ({
  serviceName: serviceName(rootDir),
  handler: { [name]: { handler: handlerName(rootDir) } },
  dataSources: [ { type: 'AWS_LAMBDA', name, config: { functionName: name } } ],
  mappingTemplates: fields.map(({ type, field }) => ({
    dataSource: name,
    type,
    field,
    request: false,
    response: false
  })),
})

const serviceName = (rootDir: string) => rootDir.substring(rootDir.lastIndexOf('/') + 1)
const handlerName = (rootDir: string) => `${__filename.replace(`${rootDir}/`, '').replace(/.ts$/, '')}.${name}`
const fields = Object.keys(resolvers).flatMap(type => Object.keys(resolvers[type as Parent]).map(field =>
  ({ type, field })
))