const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

//load config
dotenv.config();

const app = express();

//Middelwares
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`server is running on ${PORT} `)
})