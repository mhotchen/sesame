import { AppSyncResolverHandler } from 'aws-lambda'
import { resolvers } from './resolvers'
import { createIntegratedContext, createInternalError } from './context'
// Avoid importing the graph directly to keep this config generic across all services/graphql implementations

type Parent = Extract<keyof Required<typeof resolvers>, 'Query' | 'Mutation' | 'Subscription'>
type FieldName = keyof typeof resolvers[Parent]
type Fn = typeof resolvers[Parent][FieldName]
type Args = Exclude<Parameters<Fn>[1], {}>
type Response = ReturnType<Fn>

const name = 'graphqlHandler' // must match export const name for serverless.ts config
export const  graphqlHandler: AppSyncResolverHandler<Args, Response> = async event => {
  console.log(event)

  const type = event.info.parentTypeName as Parent
  const field = event.info.fieldName as FieldName

  try {
    // I think we can use the first argument to the resolvers (parent) in situations where queries are nested
    // (eg. query a User, which returns the option of getting their nested BlogPosts, then we can set the parent
    // argument to the User object). There are some solutions to N+1 problems (AWS AppSync supports batch operations
    // so if querying the nested BlogPosts means resolving one blog post at a time, a batch operation can be set up
    // in AWS Lambda to pass in up to 100 graph queries to a single Lambda handler; this functionality seems new and
    // isn't supported by the serverless appsync plugin right now)
    // await instead of returning the resolver promise directly so we can handle exceptions
    return await resolvers[type][field](undefined, event.arguments, await createIntegratedContext(process.env))
  } catch (error) {
    console.error(error)

    // Exact response type for internal errors is up to the service/context, to allow this file to remain generic across
    // all services. Note that it must match the Response type above, based on the resolver configuration, meaning it
    // must be a response type that is defined as part of the graph
    return createInternalError()
  }
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
const fields = Object.keys(resolvers).flatMap(type => Object.keys(resolvers[type]).map(field => ({ type, field })))