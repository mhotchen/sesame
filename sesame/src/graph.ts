import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  _FieldSet: any;
};

export type CreateUserResult = ErrorResult | CreateUserSuccessResult;

export type CreateUserSuccessResult = {
  readonly __typename: 'CreateUserSuccessResult';
  readonly temporaryPassword: Scalars['String'];
};

export type ErrorResult = {
  readonly __typename: 'ErrorResult';
  readonly type: ErrorType;
  readonly errorMessage: Scalars['String'];
};

export enum ErrorType {
  InvalidGroups = 'InvalidGroups',
  InternalError = 'InternalError'
}

export type Query = {
  readonly __typename: 'Query';
  readonly doesAppsyncSuck: Scalars['Boolean'];
  readonly createUser: CreateUserResult;
  readonly createGroup?: Maybe<ErrorResult>;
};


export type QueryCreateUserArgs = {
  email: Scalars['String'];
  groups: ReadonlyArray<InputMaybe<Scalars['String']>>;
};


export type QueryCreateGroupArgs = {
  name: Scalars['String'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info?: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info?: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info?: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info?: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info?: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info?: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  CreateUserResult: ResolversTypes['ErrorResult'] | ResolversTypes['CreateUserSuccessResult'];
  CreateUserSuccessResult: ResolverTypeWrapper<CreateUserSuccessResult>;
  String: ResolverTypeWrapper<Scalars['String']>;
  ErrorResult: ResolverTypeWrapper<ErrorResult>;
  ErrorType: ErrorType;
  Query: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  CreateUserResult: ResolversParentTypes['ErrorResult'] | ResolversParentTypes['CreateUserSuccessResult'];
  CreateUserSuccessResult: CreateUserSuccessResult;
  String: Scalars['String'];
  ErrorResult: ErrorResult;
  Query: {};
  Boolean: Scalars['Boolean'];
};

export type CreateUserResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateUserResult'] = ResolversParentTypes['CreateUserResult']> = {
  __resolveType: TypeResolveFn<'ErrorResult' | 'CreateUserSuccessResult', ParentType, ContextType>;
};

export type CreateUserSuccessResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateUserSuccessResult'] = ResolversParentTypes['CreateUserSuccessResult']> = {
  temporaryPassword?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ErrorResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['ErrorResult'] = ResolversParentTypes['ErrorResult']> = {
  type?: Resolver<ResolversTypes['ErrorType'], ParentType, ContextType>;
  errorMessage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  doesAppsyncSuck?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createUser?: Resolver<ResolversTypes['CreateUserResult'], ParentType, ContextType, RequireFields<QueryCreateUserArgs, 'email' | 'groups'>>;
  createGroup?: Resolver<Maybe<ResolversTypes['ErrorResult']>, ParentType, ContextType, RequireFields<QueryCreateGroupArgs, 'name'>>;
};

export type Resolvers<ContextType = any> = {
  CreateUserResult?: CreateUserResultResolvers<ContextType>;
  CreateUserSuccessResult?: CreateUserSuccessResultResolvers<ContextType>;
  ErrorResult?: ErrorResultResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};

