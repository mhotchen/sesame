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

export type ErrorResult = {
  readonly __typename: 'ErrorResult';
  readonly type: ErrorType;
};

export enum ErrorType {
  InvalidGroups = 'InvalidGroups',
  InvalidPassword = 'InvalidPassword',
  EmailAlreadyInUse = 'EmailAlreadyInUse',
  InternalError = 'InternalError'
}

export type Query = {
  readonly __typename: 'Query';
  readonly doesAppsyncSuck: Scalars['Boolean'];
  readonly createUser: UserCreateResult;
  readonly createGroup?: Maybe<ErrorResult>;
};


export type QueryCreateUserArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
  groups: ReadonlyArray<Scalars['String']>;
};


export type QueryCreateGroupArgs = {
  name: Scalars['String'];
};

export type UserCreateResult = UserCreateSuccessResult | ErrorResult;

export type UserCreateSuccessResult = {
  readonly __typename: 'UserCreateSuccessResult';
  readonly id: Scalars['ID'];
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
  ErrorResult: ResolverTypeWrapper<ErrorResult>;
  ErrorType: ErrorType;
  Query: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  UserCreateResult: ResolversTypes['UserCreateSuccessResult'] | ResolversTypes['ErrorResult'];
  UserCreateSuccessResult: ResolverTypeWrapper<UserCreateSuccessResult>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ErrorResult: ErrorResult;
  Query: {};
  Boolean: Scalars['Boolean'];
  String: Scalars['String'];
  UserCreateResult: ResolversParentTypes['UserCreateSuccessResult'] | ResolversParentTypes['ErrorResult'];
  UserCreateSuccessResult: UserCreateSuccessResult;
  ID: Scalars['ID'];
};

export type ErrorResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['ErrorResult'] = ResolversParentTypes['ErrorResult']> = {
  type?: Resolver<ResolversTypes['ErrorType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  doesAppsyncSuck?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createUser?: Resolver<ResolversTypes['UserCreateResult'], ParentType, ContextType, RequireFields<QueryCreateUserArgs, 'email' | 'password' | 'groups'>>;
  createGroup?: Resolver<Maybe<ResolversTypes['ErrorResult']>, ParentType, ContextType, RequireFields<QueryCreateGroupArgs, 'name'>>;
};

export type UserCreateResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserCreateResult'] = ResolversParentTypes['UserCreateResult']> = {
  __resolveType: TypeResolveFn<'UserCreateSuccessResult' | 'ErrorResult', ParentType, ContextType>;
};

export type UserCreateSuccessResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserCreateSuccessResult'] = ResolversParentTypes['UserCreateSuccessResult']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  ErrorResult?: ErrorResultResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  UserCreateResult?: UserCreateResultResolvers<ContextType>;
  UserCreateSuccessResult?: UserCreateSuccessResultResolvers<ContextType>;
};

