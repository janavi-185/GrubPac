const { Sequelize } = require('sequelize');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

let sequelize;

if (DATABASE_URL) {
  // Use connection string (Neon DB, Render, etc.)
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Required for Neon/Render
      },
    },
  });
} else {
  // Use separate parameters (Local DB)
  const DB_NAME = process.env.DB_NAME || 'postgres';
  const DB_USER = process.env.DB_USER || 'postgres';
  const DB_PASS = process.env.DB_PASS || '';
  const DB_HOST = process.env.DB_HOST || '127.0.0.1';
  const DB_PORT = process.env.DB_PORT || 5432;

  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false,
  });
}

const connectDB = async () => {
  try {
    const target = DATABASE_URL ? 'Online Neon DB' : 'Local Database';
    console.log(`Connecting to ${target}...`);
    
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('Database models synced.');
  } catch (error) {
    console.error('--- DATABASE CONNECTION ERROR ---');
    console.error('Error:', error.message);
    if (DATABASE_URL) {
      console.error('Tip: Check if your Neon DATABASE_URL is correct and includes the password.');
    } else {
      console.error('Tip: Ensure your local database is running.');
    }
    console.error('---------------------------------');
  }
};

module.exports = { sequelize, connectDB };
