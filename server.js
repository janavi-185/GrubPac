const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('./src/config/env.js')

const BaseURL='http://localhost'
const PORT = process.env.PORT || 3000

const app = require('./src/app.js')
const { connectDB } = require('./src/config/db.js')


const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => console.log(`Server on ${BaseURL}:${PORT}`)) 
}

startServer()