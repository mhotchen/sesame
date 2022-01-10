import { ErrorType, Resolvers } from './graph'
import { ResolverContext } from './context'

// Business logic begins in the resolvers. These functions can be isolated in to separate files if preferred.
// Note that the types are strict for the requests and responses. If you change __typename to be a string for a type
// name that isn't expected for the given resolver for example (eg. change __typename: 'ErrorResult' to 'Foo'), then
// a compilation error will happen. The selected __typename also must be returned with the correct fields and types
// for the given GraphQL resolver type. Arguments and context are both properly resolved types

const doesAppsyncSuck: typeof resolvers.Query.doesAppsyncSuck = async (parent, args, context) => {
  console.log('Query.doesAppsyncSuck', parent, args, context)

  return true
}

const createGroup: typeof resolvers.Query.createGroup = async (parent, args, context) => {
  console.log('Query.createGroup', parent, args, context)

  await context.userService.createGroup(args.name)

  return null
}

const createUser: typeof resolvers.Query.createUser = async (parent, args, context) => {
  console.log('Query.createUser', parent, args, context)

  const invalidGroups = (await context.userService.groupsExist(args.groups)).filter(g => !g.exists)
  if (invalidGroups.length > 0) {
    return {
      __typename: 'ErrorResult',
      type: ErrorType.InvalidGroups,
      errorMessage: `The following groups don't exist: ${invalidGroups.map(g => g.group).join(', ')}`
    }
  }

  const temporaryPassword = await context.userService.createUser(args.email)

  await Promise.all(args.groups.map(group => context.userService.addUserToGroup(args.email, group)))

  return { __typename: 'CreateUserSuccessResult', temporaryPassword }
}

export const resolvers: Resolvers<ResolverContext> = {
  Query: {
    doesAppsyncSuck,
    createUser,
    createGroup,
  },
}