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
// 🛠️ FIX: Self-Healing Database Connection
// ----------------------------------------------------
const connectDB = async () => {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const state = mongoose.connection.readyState;

    // If we are already connected (1), stop here. We are good.
    if (state === 1) {
        return;
    }

    // If we are connecting (2), wait a moment for it to finish
    if (state === 2) {
        return mongoose.connection.asPromise();
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Error: ${error.message}`);
        throw error;
    }
}

// Middleware to ensure DB is alive before every request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database middleware failed:", error);
        res.status(500).json({ message: "Database Connection Failed" });
    }
});

// Test Route
app.get('/', (req, res) => {
    res.send("API is Running");
});

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;