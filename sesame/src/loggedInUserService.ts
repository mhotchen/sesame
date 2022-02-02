export type User = { sub: string, email: string, groups: string[] }
export type MaybeUser = User | undefined

export type LoggedInUserService = {
  loggedInUser: MaybeUser,
}

export const loggedInUserService = (loggedInUser: MaybeUser): LoggedInUserService => ({
  loggedInUser,
})