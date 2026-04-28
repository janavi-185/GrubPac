const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('./src/config/env.js');

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = require('./src/app.js');
const { connectDB } = require('./src/config/db.js');

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    const baseUrl = NODE_ENV === 'production'
      ? (process.env.SERVER_URL || `http://0.0.0.0:${PORT}`)
      : `http://localhost:${PORT}`;
    console.log(`Server running on ${baseUrl}`);
    console.log(`API Docs: ${baseUrl}/api-docs`);
  });
};

startServer();