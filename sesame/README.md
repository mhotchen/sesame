# Architecture

## At a glance

The eventual goal of what I am building with this service is to use GraphQL to distribute work across various services/
AWS Lambda handler executions with a single graph query being capable of executing many Lambdas across disparate
services. It should integrate smoothly with our existing ways of working.

This specific service has the goal of managing users and their permissions. Users and their groups would be stored in
AWS Cognito. Authorization rules provided by Casbin.

I plan on creating a second service which will have various GraphQL handlers with different permissions to validate that
this permissions system works.

I then plan on "federating" or "meshing" these two GraphQL endpoints together so that the web clients can make a single
request across multiple services. I am hoping to achieve this using GraphQL mesh (https://www.graphql-mesh.com/). This
tool can either be used as a client library, from the web apps, or can be hosted in a docker container running in the
cloud. I expect some challenges with federated graphs and authentication/Cognito.

In order to achieve the above I have opted to use AWS AppSync as the GraphQL implementation. In doing so we can
distribute resolver executions across AWS Lambdas.

AWS AppSync is terrible, and far, far behind what the open source community is achieving with GraphQL.

I initially opted for Apollo server which is an open source library for processing GraphQL requests and executing
resolvers. This would have used API Gateway with a /graphql endpoint, and API Gateway websockets support for pub/sub.

Resolvers from Apollo server, and from the GraphQL codegen library, both match a certain interface. AWS AppSync does not
match this interface when it comes to the AWS Lambda handlers. Apollo server is a very clean library and was easy to
configure.

However the main limitation I found was that Apollo server, with the implementation it has for AWS Lambda
(https://github.com/apollographql/apollo-server/tree/main/packages/apollo-server-lambda) will resolve the full query in
a single AWS Lambda handler execution. I want each GraphQL resolver to be executed in isolation within its own AWS
Lambda environment, simply because the mapping of a resolver in the query, which looks much like a function call, to
a resolver in the backend, running in an isolated AWS Lambda handler instance, simplifies my mental understanding in
terms of scalability, performance, and isolation.

AppSync supports this natively, and in 2020 released some improvements to the configuration of Lambda invocations
via GraphQL, avoiding the need to use "VTL", an awful configuration language, between the Lambdas and GraphQL. In
addition it has native support for DynamoDB, and OpenSearch, so it's possible to avoid writing Lambdas entirely although
with the clunky syntax for doing so, and with the resolver setup I've been targeting, we may find it easier to simply
set up a resolver in code.

AppSync already has a solved pub/sub model for GraphQL subscriptions. When looking at using Apollo server with
API Gateway, whilst API Gateway has good support for pub/sub via websockets, there would still be some setting up to
achieve this.

It's possible to manage multiple AppSync instances from the same serverless service, so it's possible to continue our
existing way of working of combining admin endpoints and member endpoints on related data/functionality in to a single
service. However with the breakdown of teams we have at the moment there remains the question of whether we want to
begin breaking admin and member endpoints in to separate services, eg. health-achievements-member,
health-achievements-admin, and pushing related code/data access down in to shared libraries. I honestly don't think
this would fundamentally resolve the issues we face when stepping on each other's toes, since the shared functionality
would still need to be sequenced, accessed, and modified across teams. If the admin/member GraphQL resolvers themselves
are isolated by files then ultimately I see each implementation as providing the same level of isolation. There would
be some additional work to add support for more than one AppSync config per-service.

As our goal for Q1/member profile we will only be targeting the admin dashboard, so the above isn't as relevant. If
we can federate multiple AppSync endpoints in to a single graph, then it would be fantastic to also merge our existing
AppSync endpoint for the admin dashboard in to this federated graph, and eventually refactor it to utilise this new
service architecture, smoothing out the implementation for direct DynamoDB access via AppSync along the way.

There are other tools I'm experimenting with in this service:

- Google's zx as a replacement for bash in our scripts and CI (https://github.com/google/zx)
- Prisma as a SQL client library (not experimented with - but the type safety it provides and the reasonably
  expressive query language may ultimately be worth it; only concerned with "serverless scale DB connections" which is
  easier to solve with the mysql/mysql2 kind of node.js mysql client implementations)
- Casbin as an authorization implementation for flexible and scalable RBAC/ABAC permission models (https://casbin.org/)

Overall goals:

- Distributed GraphQL query workloads that map resolvers to AWS Lambda handler execution instances
- Cross-service GraphQL queries
- Type safety throughout
- Dependency injection of services
- Flexible authorization implementation that maintains compatibility with Cognito users/groups
- Improving our scripts/bash/CI mess

## `src/MigrateDatabase.js`

MigrateDatabase executes the DB migrations as part of a serverless plugin during deployment. This will not be useful
for cross-service databases.

Serverless framework does not support TypeScript plugins so it is written in JS.

This plugin generates a .env file based on the resolved environment property of the serverless.ts configuration, which
is used when executing the database migrations via Prisma, before executing the DB migrations using the CLI (utilising
google's zx library to invoke commands on the CLI).

## `src/context.ts`

This file defines the expected context within which the graphql will be executed.

It defines the environment variables, which must then be implemented in the serverless.ts, which relies on this type,
with type errors if the expected environment is not fully populated in the serverless.ts file.

The `ResolverContext` type is used in serverless.ts and the resolvers.ts to provide an expected context to the
graphql resolvers. Again, should this type change, a compilation error is produced if the context is not properly
configured/used elsewhere.

It also provides a function for creating an integrated context, setting up the database and other services.

These are then passed in to the resolvers, all done in a type-safe fashion from the handler in serverlessConfig.ts

## `src/graph.ts`

This file is generated using the graphql-codegen library, configured using codegen.yml. There were some custom options
necessary in codegen.yml in order to get it working smoothly

It should be committed to source, but not modified.

Generate the graph:

```
npx graphql-codegen
```

## `src/resolvers.ts`

This file contains an implementation of the Resolver type generated by graphql-codegen. This is where the actual
business logic begins.

## `src/serverlessConfig.ts`

This file is used within the root serverless.ts to configure AppSync, and has the AWS Lambda handler implementation for
responding to GraphQL requests.

It uses a single AWS Lambda handler for all AppSync requests. In a type-safe way, it converts the AWS Lambda AppSync
resolver in to a proper resolver definition.

This file would probably exist in a library somewhere and be consistent across all services/AppSync implementations, so
we use the same handler logic across all GraphQL implementations.

## `src/userService.ts`

This provides a type for a service which is expected in the context, used for managing users. It also provides a factory
function for creating a concrete implementation of the UserService type which uses AWS Cognito. We could provide other
definitions of the `UserService` type for unit testing purposes for example.

## Prisma

I use Prisma as the DB client for Casbin. I have not explored it any further

Generate prisma client:

```
npx prisma generate
```

Using the `prisma/schema.prisma` file, generates a Prisma client library for the database. The only schema set up
is a generic policy rules table for Casbin.

Migrations are automatically generated and executed during serverless deployment.

## Casbin

Casbin is basically a generic expression language that is cross-language/cross-platform, using expression evaluator
libraries for whatever platform you install it on (expression evaluator meaning turning a string like "a = 1 + 2" in to
an AST/abstract syntax tree) with some specific functionality targeted towards authorization.

In being so generic, it supports RBAC, ABAC, and all kinds of custom authorization implementations. In being so generic
it has a steep learning curve. There is a dearth of resources around it

I am yet to get a full understanding. I am aiming to start with a very simple inherited RBAC model with separation of
US/other region member data. To do so I have the following options

- domains to separate UK/US members/staff (members created in the UK domain for example; supports cross-domain roles)
- using properties on the policies and resources to achieve the same
- using namespaces to achieve the same (so US coaches can read /users/us/* for example)