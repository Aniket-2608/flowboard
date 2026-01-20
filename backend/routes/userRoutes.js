const express = require('express');
const router = express.Router();
const {registerUser, loginUser, verifyEmail, resetPassword, forgotPassword} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
module.exports = router;