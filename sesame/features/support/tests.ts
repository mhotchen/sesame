import { GraphQLClient } from 'graphql-request'
import { getSdk } from './graphqlClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { Context, integratedContext } from '../../src/context'
import { ServiceInfo } from './serviceInfo'
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider'
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'

const graphqlClient = new GraphQLClient(ServiceInfo.GraphQlApiUrl)
const graph = getSdk(graphqlClient)
const cognito = new CognitoIdentityProviderClient({})
const ssm = new SSMClient({})
const password = 'au(fjf3G'
const results: any[] = []

const ssmValue = async (
  namespace: string,
  key: string,
  service: string = ServiceInfo.ServiceName
) => (await ssm.send(new GetParameterCommand({
  Name: `/${namespace}/${service}/${key}`,
  WithDecryption: true
})))?.Parameter?.Value ?? ''

const login = async (
  email: string,
  password: string
) => (await cognito.send(new InitiateAuthCommand({
  AuthFlow: 'USER_PASSWORD_AUTH',
  AuthParameters: {
    USERNAME: email,
    PASSWORD: password,
  },
  ClientId: await ssmValue('user-pool', 'client-web-id')
})))?.AuthenticationResult?.AccessToken ?? ''

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
  await (await getIntegratedContext()).userManagementService.createUser(email, password)
  await (await getIntegratedContext()).userManagementService.addUserToGroup(email, group)
  graphqlClient.setHeader('Authorization', await login(email, password))
})

When('I create the group {string}', async name => {
  results.push(await graph.createGroup({ name }))
})

When('I create the user {string} in group {string}', async (email, group) => {
  results.push(await graph.createUser({ email, password: 'Matt(T3stn', groups: [ group ] }))
})

Then('I log the results', () => {
  console.log(results)
})