const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load config
dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://fluxalab.vercel.app', // Your Frontend
    'https://flowboard-3m4r.vercel.app' // (Optional) Your future backend URL
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Database connection 
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Execute Connection
connectDB();

// ✅ FIXED Test Route (Simple and Safe)
app.get('/', (req, res) => {
    res.send("API is Running");
});

// Start the Server
const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
}

module.exports = app;