const express = require('express');
const router = express.Router();
const {registerUser, loginUser} = require('../controllers/userController');

//define the route
router.post('/register', registerUser);
router.post('/login', loginUser);
module.exports = router;