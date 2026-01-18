const express = require('express');
const router = express.Router();
const {registerUser, loginUser, verifyEmail} = require('../controllers/userController');

//define the route
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', verifyEmail);
module.exports = router;