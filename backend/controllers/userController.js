const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail')

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
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = crypto.randomBytes(20).toString('hex');

        //creating the user
        const user = await User.create({
            name,
            email,
            password : hashedPassword, // Save the encrypted version
            verificationToken,
            // Set expiry to 24 hours from now
            verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000
        })

        if(user){
            const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/verify?token=${verificationToken}`;
            const message = `
                <h1>Welcome to FluxaLab!</h1>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${verifyUrl}" clicktracking=off>${verifyUrl}</a>
            `;

            try {
                await sendEmail(user.email, 'Verify your email', message);
                
                res.status(201).json({
                    message: `Registration successful! Please check your email: ${user.email} to verify account.`
                });
            } catch (emailError) {
                // If email fails, delete the user so they can try again
                await User.findByIdAndDelete(user._id);
                return res.status(500).json({ message: "Email could not be sent. Please try again." });
            }
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

const verifyEmail = async (req, res)=>{
    try{
        const {token} = req.body // token will be sent front the frontend

        if(!token){
            return res.status(400).json({message : "Invalid User TOKEN"})
        }

        const user = await User.findOne({
            verificationToken : token,
            verificationTokenExpires : { $gt: Date.now() } // $gt means "Greater Than" now
        })

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification token" });
        }

        // verify the user.
        user.isVerified = true;
        user.verificationToken = undefined; // Clear the token
        user.verificationTokenExpires = undefined;
        await user.save();

        res.status(200).json({
            message: "Email verified successfully! You can now login."
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//login
const loginUser = async(req, res)=>{
    try{
        const {email, password} = await req.body;

        //check if the user exists
        const user = await User.findOne({email});

        //check if the password matches
        //comparing the plain text entered password with the hashed one.
        if(user && (await bcrypt.compare(password, user.password))){
            if (!user.isVerified) {
                return res.status(401).json({ 
                    message: "Please verify your email before logging in." 
                });
            }
            res.status(200).json({
                _id: user.id,
                name : user.name,
                email : user.email,
                role : user.role,
                token : generateToken(user._id)
            })
        }else{
            res.status(401).json({
                message : "Invalid email or password"
            })
        }
    }
    catch(error){
        res.status(500).json({ message : error.message });
    }
}

//Helper Function to generate token
const generateToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn : '30d',
    });
}

module.exports ={
    registerUser,
    loginUser,
    verifyEmail
}