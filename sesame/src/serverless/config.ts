export const getServiceName = (rootDir: string) =>
  rootDir.substring(rootDir.lastIndexOf('/') + 1)

export const getHandlerName = (rootDir: string, fileName: string, handlerName: string) =>
  `${fileName.replace(`${rootDir}/`, '').replace(/.ts$/, '')}.${handlerName}`
