const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;
const DATABASE_URL = process.env.DATABASE_URL;

if (DATABASE_URL) {
  // Strip sslmode/channel_binding from the URL — let dialectOptions handle SSL explicitly
  // to avoid pg-connection-string SSL deprecation warnings
  const cleanUrl = DATABASE_URL
    .replace(/[?&]sslmode=[^&]*/g, '')
    .replace(/[?&]channel_binding=[^&]*/g, '')
    .replace(/\?$/, '');

  sequelize = new Sequelize(cleanUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'postgres',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );
}

const connectDB = async () => {
  try {
    const target = DATABASE_URL ? 'Neon DB' : 'Local Database';
    console.log(`Connecting to ${target}...`);
    await sequelize.authenticate();
    console.log('Database connection established.');
    await sequelize.sync({ alter: true });
    console.log('Models synced.');
  } catch (error) {
    console.error('DATABASE CONNECTION ERROR:', error.message);
    if (DATABASE_URL) {
      console.error('Tip: Check your Neon DATABASE_URL in .env');
    } else {
      console.error('Tip: Ensure your local PostgreSQL is running.');
    }
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
