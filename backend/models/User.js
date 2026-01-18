const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true, //Validation - Name is mandatory
        },
        email: {
            type: String,
            required: true,
            unique: true, //Validation - No two users can have same identical email ids.
        },
        password: {
            type: String,
            required: true, //Validation - Name is mandatory
        },
        //For RBAC - Role Based Access Control
        role: {
            type: String,
            enum: ['user', 'admin'], // only these two values are allowed.
            default: 'user', // IF not specified, everyone will be a normal user
        },
        isVerified: {
            type: Boolean,
            default: false // 👈 Default is NOT verified
        },
        verificationToken: String, // To store the temporary code
        verificationTokenExpires: Date
    },
    {
        Timestamps: true, // Automatically creates created at and updated at fields.
    }
);

//Export the Model
module.exports = mongoose.model('User', userSchema);