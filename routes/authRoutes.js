import express from 'express';
import { loginController, otpForSighUp, registerController, verifyOtpController } from '../controller/authController.js';


// router object 
const router = express.Router();


// Routes 

// Register || method post
router.post('/register', registerController);

// send otp for register || post
router.post('/otp-for-register', otpForSighUp);

// verify otp for register || post
router.post('/verify-otp', verifyOtpController);

// login || post
router.post('/login', loginController);

export default router;