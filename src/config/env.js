try {
  require('dotenv').config();
} catch (e) {
  // dotenv not available — env vars already injected by the platform (Render, etc.)
}

const getRequiredEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

module.exports = { getRequiredEnv };
