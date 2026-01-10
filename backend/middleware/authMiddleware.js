/*
    Auth Middeware -
     Right now the APi is open, anybody can ask for data. We need a middleware that sits in front of our private routes 
     like -"get my tasks". It checks the request header for the JWT token. If the token is valid, it lets the request pass and
     attaches the user's info to it. If invalid/not found, it will throw unauthorised access.
*/

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async(req, res, next)=>{
    let token;
    // 1. Check if the "Authorization" header exists and starts with "Bearer"
    // Format: "Bearer <token_string>"
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            // 2. Get the token from the header (remove 'Bearer ' space)
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify the token using our Secret Key
            const decoded =jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find the user associated with this token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            // 5. Move to the next middleware/controller
            next();
        }
        catch(error){
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if(!token){
        res.status(401).json({ message: 'Not authorized, no token' });
    }
}

module.exports = { protect };