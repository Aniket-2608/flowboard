const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res)=>{
    try{
        const{name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({message : "Please add all the fields"})
        }

        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message : "User already exists with this email"})
        }

        //hash the password
        // Salt is random data added to the password before hashing to make it stronger.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hashedPassword(password, salt)

        //creating the user
        const user = await User.create({
            name,
            email,
            password : hashedPassword, // Save the encrypted version
        })

        if(user){
            res.status(200).json({
                _id : user.id,
                name : user.name,
                email : user.email,
                role : user.role,
                token : generateToken(user._id)
            })
        }else{
            res.status(400).json({
                message : 'Invalid User Data'
            })
        }
    }
    catch(error){
        res.status(500).json({message : error.message});
    }
};

//Helper Function to generate token
const generateToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn : '30d',
    });
}

module.exports ={
    registerUser,
}