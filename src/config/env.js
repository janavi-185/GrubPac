const dotenv = require('dotenv')
const path = require('path')

const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config()
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const getRequiredEnv = (key) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

module.exports = {
  getRequiredEnv
}
