import { Resolvers } from './graph'

export type Parent = Extract<keyof Required<Resolvers>, 'Query' | 'Mutation' | 'Subscription'>
export type ResolverRequired = Required<Pick<Resolvers, Parent>>
export type FieldName = keyof ResolverRequired[Parent]
export type Fn = NonNullable<ResolverRequired[Parent][FieldName]>
export type Args = Exclude<Parameters<Fn>[1], {}>
export type Response = ReturnType<Fn>