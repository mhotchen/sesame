const fs = require('fs')
const { $ } = require('zx')

$.verbose = false
const result = commandResult => JSON.parse(commandResult.stdout)

module.exports = class MigrateDatabase {
  constructor (serverless) {
    this.serverless = serverless
    this.hooks = {
      'after:deploy:finalize': () => this.generateStackOutput(),
    }
  }

  async generateStackOutput () {
    // I looked at doing the following functionality, of getting stack output, via serverless using eg. the following in
    // environment variables in serverless.ts:
    //
    // GRAPHQL_ENDPOINT: { "Fn::GetAtt": [ "GraphQlApi", "GraphQLUrl" ] },
    // GRAPHQL_API_KEY: { "Fn::GetAtt": [ "GraphQlApiKeydefault", "ApiKey" ] },
    //
    // Unfortunately whilst this created environment variables within AWS, the resolved values are never made available
    // to serverless at any point. So instead generate an enum of stack outputs after deploying the service.

    const serviceInfo = result(await $`./node_modules/.bin/serverless print --format json`)
    const stackName = `${serviceInfo.service.name}-${serviceInfo.provider.stage}`
    const outputs = result(await $`aws cloudformation describe-stacks --stack-name ${stackName}`)['Stacks'][0].Outputs

    fs.writeFileSync('features/support/stackOutput.ts', `/* generated file do not edit */export const enum StackOutput {
      ${outputs.map(output => `${output.OutputKey} = "${output.OutputValue}"`).join(',\n')}
    }`)
  }
}