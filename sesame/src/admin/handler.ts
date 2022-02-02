import { Handler } from 'aws-lambda'

import { integratedContext } from '../context'
import { getHandlerName } from '../serverless/config'

const name = 'addAdminPolicy'
export const  addAdminPolicy: Handler = async event => {
  console.log(event)
  const context = await integratedContext(process.env)
  await context.enforcer.addPolicy('admin', '*', '*')
}

export const addAdminPolicyConfig = (rootDir: string) => ({
  handler: { [name]: { handler: getHandlerName(rootDir, __filename, name) } },
})