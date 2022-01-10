const fs = require('fs')
const { $ } = require('zx')

module.exports = class MigrateDatabase {
  constructor (serverless) {
    this.serverless = serverless
    this.hooks = {
      'after:deploy:initialize': () => this.migrateDatabase(),
    }
  }

  async migrateDatabase () {
    const env = this.serverless.configurationInput.provider.environment
    fs.writeFileSync('.env', Object.keys(env).map(key => `${key} = ${env[key]}\n`).join(''))
    await $`npx prisma migrate dev`
  }
}