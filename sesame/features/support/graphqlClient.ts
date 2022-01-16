import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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

export type CreateUserQueryVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  groups: ReadonlyArray<Scalars['String']> | Scalars['String'];
}>;


export type CreateUserQuery = { readonly __typename: 'Query', readonly createUser: { readonly __typename: 'UserCreateSuccessResult', readonly id: string } | { readonly __typename: 'ErrorResult', readonly type: ErrorType } };

export type CreateGroupQueryVariables = Exact<{
  name: Scalars['String'];
}>;


export type CreateGroupQuery = { readonly __typename: 'Query', readonly createGroup?: { readonly __typename: 'ErrorResult', readonly type: ErrorType } | null | undefined };


export const CreateUserDocument = gql`
    query createUser($email: String!, $password: String!, $groups: [String!]!) {
  createUser(email: $email, password: $password, groups: $groups) {
    __typename
    ... on ErrorResult {
      __typename
      type
    }
    ... on UserCreateSuccessResult {
      __typename
      id
    }
  }
}
    `;
export const CreateGroupDocument = gql`
    query createGroup($name: String!) {
  createGroup(name: $name) {
    __typename
    ... on ErrorResult {
      __typename
      type
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    createUser(variables: CreateUserQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateUserQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateUserQuery>(CreateUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createUser');
    },
    createGroup(variables: CreateGroupQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateGroupQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateGroupQuery>(CreateGroupDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createGroup');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;