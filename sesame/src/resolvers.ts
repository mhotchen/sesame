import { ErrorResult, ErrorType, Resolvers, UserCreateResult } from './graph/graph'
import { Context } from './context'
import { exception, promiseMap } from './utils'
import { Parent } from './graph/types'

// Business logic begins in the resolvers. These functions can be isolated in to separate files if preferred.
// Note that the types are strict for the requests and responses. If you change __typename to be a string for a type
// name that isn't expected for the given resolver for example (eg. change __typename: 'ErrorResult' to 'Foo'), then
// a compilation error will happen. The selected __typename also must be returned with the correct fields and types
// for the given GraphQL resolver type. Arguments and context are both properly resolved types

const error = (type: ErrorType): ErrorResult => ({ __typename: 'ErrorResult', type })

export const internalError = () => error(ErrorType.InternalError)

export const resolvers: Required<Pick<Resolvers<Context>, Parent>> = {
  Query: {
    doesAppsyncSuck: () => true,
    createGroup: (_, args, context) => context.userService.createGroup(args.name),
    createUser: async (_, args, context) => {
      if ((await promiseMap(args.groups, context.userService.isValidGroup)).includes(false)) {
        return error(ErrorType.InvalidGroups)
      }

      return exception<UserCreateResult>(
        async () => {
          const id = await context.userService.createUser(args.email, args.password)
          await promiseMap(args.groups, g => context.userService.addUserToGroup(args.email, g))

          return { __typename: 'UserCreateSuccessResult', id }
        },
        { 'InvalidPasswordException': async () => error(ErrorType.InvalidPassword),
          'UsernameExistsException': async () => error(ErrorType.EmailAlreadyInUse) }
      )
    },
  },
}