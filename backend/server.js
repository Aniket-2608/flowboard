const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load config
dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:4200',            
    'https://fluxalab.vercel.app',      
    'https://flowboard-3m4r.vercel.app' 
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// ----------------------------------------------------
// 🛠️ FIX: Optimized Database Connection for Serverless
// ----------------------------------------------------
let isConnected = false; // Track connection status

const connectDB = async () => {
    if (isConnected) {
        return; // Already connected, skip
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // These options prevent timeouts in serverless
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 45000,
        });
        
        isConnected = !!conn.connections[0].readyState;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Error: ${error.message}`);
        // Don't exit process in serverless, just throw error
        throw error;
    }
}

// ----------------------------------------------------
// 🛠️ FIX: Middleware to ensure DB connection per request
// ----------------------------------------------------
app.use(async (req, res, next) => {
    try {
        await connectDB(); // Wait for DB before processing any route
        next();
    } catch (error) {
        res.status(500).json({ message: "Database Connection Failed" });
    }
});

// Test Route
app.get('/', (req, res) => {
    res.send("API is Running");
});

const PORT = process.env.PORT || 5001;

// Only listen locally
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;