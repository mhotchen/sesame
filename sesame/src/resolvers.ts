import { ErrorResult, ErrorType, Resolvers } from './graph'
import { Context } from './context'

// Business logic begins in the resolvers. These functions can be isolated in to separate files if preferred.
// Note that the types are strict for the requests and responses. If you change __typename to be a string for a type
// name that isn't expected for the given resolver for example (eg. change __typename: 'ErrorResult' to 'Foo'), then
// a compilation error will happen. The selected __typename also must be returned with the correct fields and types
// for the given GraphQL resolver type. Arguments and context are both properly resolved types

const error = (type: ErrorType): ErrorResult => ({ __typename: 'ErrorResult', type })

export const internalError = () => error(ErrorType.InternalError)
export const resolvers: Resolvers<Context> = {
  Query: {
    doesAppsyncSuck: async (parent, args, context) => {
      console.log('Query.doesAppsyncSuck', parent, args, context)

      return true
    },

    createUser: async (parent, args, context) => {
      console.log('Query.createUser', parent, args, context)

      if ((await Promise.all(args.groups.map(context.userService.isValidGroup))).includes(false)) {
        return error(ErrorType.InvalidGroups)
      }

      try {
        const id = await context.userService.createUser(args.email, args.password)
        await Promise.all(args.groups.map(group => context.userService.addUserToGroup(args.email, group)))

        return { __typename: 'UserCreateSuccessResult', id }
      } catch (error) {
        switch (error?.name) {
          case 'InvalidPasswordException': return error(ErrorType.InvalidPassword)
          case 'UsernameExistsException': return error(ErrorType.EmailAlreadyInUse)
          default: throw error
        }
      }
    },

    createGroup: async (parent, args, context) => {
      console.log('Query.createGroup', parent, args, context)

      await context.userService.createGroup(args.name)

      return null
    },
  },
}