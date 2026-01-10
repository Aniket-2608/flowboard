const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

//load config
dotenv.config();

const app = express();

//Middelwares
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

//Database connection 
const connectDB = async () =>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected : ${conn.connection.host}`);
    }
    catch(error){
        console.error(`Error : ${error.message}`);
        process.exit(1);
    }
}

//Execute Connection
connectDB();

//Test Route
app.get('/', (req, res)=>{
    const reqBody = req.body;
    if(reqBody.id !=0){
        console.log(reqBody);
    }
    res.send("API is Running");
})

//Start the Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, ()=>{
    console.log(`server is running on ${PORT} `)
})