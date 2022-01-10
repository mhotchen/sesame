import type { AWS } from '@serverless/typescript'
import { getConfig } from './src/serverlessConfig'

const config = getConfig(__dirname)

const ssm = (namespace: string, key: string, service: string = config.serviceName) =>
  `\${ssm:/${namespace}/${service}/${key}}`

const env: NodeJS.ProcessEnv = {
  DATABASE_URL: `postgresql://${(ssm('db', 'username'))}:${(ssm('db', 'password'))}@${(ssm('db', 'host'))}:${(ssm('db', 'port'))}/${(ssm('db', 'database'))}?schema=public`,
  USER_POOL_ID: ssm('user-pool', 'id'),
}

const serverlessConfiguration: AWS = {
  variablesResolutionMode: "20210326",
  service: config.serviceName,
  frameworkVersion: '2',
  plugins: ['serverless-appsync-plugin', 'serverless-esbuild', './src/MigrateDatabase.js'],
  provider: {
    name: 'aws',
    region: 'eu-west-2',
    stage: 'prod',
    runtime: 'nodejs14.x',
    lambdaHashingVersion: '20201221',
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      ...env
    },
    iam: { role: { statements:
      ['AdminCreateUser', 'AdminConfirmSignUp', 'AdminAddUserToGroup', 'CreateGroup', 'GetGroup']
        .map(action => ({ Effect: 'Allow', Action: `cognito-idp:${action}`, Resource: ssm('user-pool', 'arn') }))
    } },
  },
  functions: { ...config.handler },
  package: {
    individually: true,
    patterns: [
      'casbin.conf',
      'node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node',
      'node_modules/.prisma/client/schema.prisma',
    ],
  },
  custom: {
    appSync: {
      name: '${self:service}',
      schema: 'schema.graphql',
      authenticationType: 'API_KEY',
      apiKeys: [ { name: 'default', description: 'default' } ],
      mappingTemplates: config.mappingTemplates,
      dataSources: config.dataSources
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
}

module.exports = serverlessConfiguration
