type HappyFn<T> = () => Promise<T>
type SadFn<T> = (err: any) => Promise<T>
type SadFnErrorWithName<T> = { [errorName: string]: SadFn<T> }
export async function exception<T>(happy: HappyFn<T>, sad: SadFn<T>): Promise<T>
export async function exception<T>(happy: HappyFn<T>, sad: SadFnErrorWithName<T>): Promise<T>
export async function exception<T>(happy: HappyFn<T>, sad: SadFnErrorWithName<T> | SadFn<T>): Promise<T> {
  try {
    return await happy()
  } catch (error) {
    const isErrorWithName = (error: unknown): error is { name: string } =>
      typeof error === 'object' && error !== null && Object.keys(error).includes('name')
    if (typeof sad === 'function') return await sad(error)
    if (isErrorWithName(error) && sad[error.name] !== undefined) return await sad[error.name](error)

    throw error
  }
}

export const promiseMap = <T, U>(args: readonly T[], map: (arg: T) => Promise<U>): Promise<U[]> =>
  Promise.all(args.map(map))

export const logAny = (toLog: any): any => {
  if (Array.isArray(toLog)) {
    return toLog.map(logAny)
  }

  if (typeof toLog === 'object') {
    let newResponse = { ...toLog }
    Object.keys(newResponse).forEach(key => {
      if (!['__typename', 'type'].includes(key)) {
        newResponse[key] = logAny(newResponse[key])
      }
    })

    return newResponse
  }

  return typeof toLog
}

