try {
  require('dotenv').config();
} catch (e) {
  
}

const getRequiredEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

module.exports = { getRequiredEnv };
