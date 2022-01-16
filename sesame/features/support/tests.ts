import { GraphQLClient } from 'graphql-request'
import { getSdk } from './graphqlClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { integratedContext, Context } from '../../src/context'
import { StackOutput } from './stackOutput'

const gql = getSdk(new GraphQLClient(
  StackOutput.GraphQlApiUrl,
  { headers: { "X-Api-Key": StackOutput.GraphQlApiKeyDefault } }
))

const results: any[] = []
const getIntegratedContext = (() => {
  let context: Context | undefined = undefined
  return async () => {
    if (context === undefined) {
      context = await integratedContext(process.env)
    }

    return context
  }
})()

Given('I am the user {string} in group {string}', async (email, group) => {
  await (await getIntegratedContext()).userService.createUser(email, 'au(fjf3G')
  await (await getIntegratedContext()).userService.addUserToGroup(email, group)
})

When('I create the group {string}', async name => {
  results.push(await gql.createGroup({ name }))
})

When('I create the user {string} in group {string}', async (email, group) => {
  results.push(await gql.createUser({ email, password: 'Matt(T3stn', groups: [ group ] }))
})

Then('I log the results', () => {
  console.log(results)
})