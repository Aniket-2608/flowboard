const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail')

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please add all the fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists with this email" });
    }

    let user = null;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = crypto.randomBytes(20).toString('hex');

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000
        });

        // 4. Construct Email
        const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;
        const message = `
            <h1>Welcome to FlowBoard!</h1>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${verifyUrl}" clicktracking=off>${verifyUrl}</a>
        `;

        const emailResult = await sendEmail(user.email, 'Verify your email', message);

        if (emailResult) {
            return res.status(201).json({
                message: `Registration successful! Please check ${user.email} to verify your account.`
            });
        } else {
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({ message: "Email could not be sent. Please try again." });
        }

    } catch (error) {
        if (user) {
            await User.findByIdAndDelete(user._id);
        }
        console.error("Registration Error:", error.message);
        res.status(500).json({ message: "Registration failed. Please try again." });
    }
};

const verifyEmail = async (req, res)=>{
    try{
        const {token} = req.body

        if(!token){
            return res.status(400).json({message : "Invalid User TOKEN"})
        }

        const user = await User.findOne({
            verificationToken : token,
            verificationTokenExpires : { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification token" });
        }

        // verify the user.
        user.isVerified = true;
        user.verificationToken = undefined;
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
        const {email, password} = req.body;

        const user = await User.findOne({email});

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