const express = require('express')
const cookieParser = require('cookie-parser')
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/Swagger");
const cors = require('cors')
const authRoutes = require('./routes/auth.routes')


const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())
app.use(cookieParser())
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Content Broadcasting System API',
    endpoints: {
      auth: '/api/auth',
      broadcast: '/api/broadcast (Coming soon)'
    }
  });
});

app.use('/api/auth', authRoutes)

// Error handling middleware for Malformed JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON format in request body' });
  }
  
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app