import { comparePassword, hashPassword } from '../helpers/authHelper.js';
import User from '../models/userModel.js'
import Otp from '../models/otpModel.js';
import JWT from 'jsonwebtoken';
import sendMail from '../mailer/mail.js';



export const registerController = async (req, res) => {

    try {
        const { name, email, password, phone } = req.body;

        // validation
        if (!name) {
            return res.send({ message: 'Name is required' })
        }
        if (!email) {
            return res.send({ message: 'Email is required' })
        }
        if (!password) {
            return res.send({ message: 'Password is required' })
        }
        if (!phone) {
            return res.send({ message: 'Phone is required' })
        }

        // check user
        const existingUser = await User.findOne({ email });

        // existing user
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: 'Already register please login',

            })
        }


        // register user
        const hashedPassword = await hashPassword(password);

        // const user = await new User.create({
        //     name: name,
        //     email: email,
        //     password: password,
        //     phone: phone,
        //     address: address,
        //     password: hashedPassword
        // })

        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            phone: req.body.phone,
            address: req.body.address,
        })

        res.status(200).send({
            success: true,
            message: "User register successfully",
            user,
        })
    } catch (error) {
        res.status(500).send({
            stauts: false,
            message: 'Error in registration',
            error
        })
    }
};


export const otpForSighUp = async (req, res) => {
    try {
        console.log("_______________");
        const { email } = req.body;
        console.log("_____________");
        console.log(email);

        if (!email) {
            console.log("___________________-");
            console.log(email);
            return res.status(400).send({
                success: false,
                message: 'email is required'
            })
        }

        // send mail
        const otp = Math.trunc(Math.random() * 9999);
        const text = `OTP is ${otp} `;
        const subject = 'OTP for Register on our website';
        const to = email;

        await sendMail(to, subject, text);


        // save otp in database
        const d = new Date();
        const saveOtp = await Otp.create({
            email: email,
            otp: otp,
            time: d.getTime()
        })

        res.status(200).send({
            success: true,
            message: "OTP Send Successfully"
        })


    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in otp send",
            error
        })
    }
}

export const verifyOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email) {
            return res.status(400).send({ success: false, message: 'email is required' })
        }
        if (!otp) {
            return res.status(400).send({ success: false, message: 'otp is required' })
        }

        const otpdb = await Otp.findOne({ email });
        const d = new Date();

        // check otp is valid or not
        if (otp !== otpdb.otp) {
            return res.status(400).send({ success: false, message: "Invalid OTP" })
        }

        // check otp expiration
        if (((d.getTime() - otpdb.time) / 1000 / 60) > 10) {
            return await Otp.deleteOne({ id: user._id }).then((d_res) => {


                res.status(400).send({ success: false, message: "OTP has been expired !! Please genrate a new OTP" })
            }).catch((err) => {
                res.status(500).send({ status: 500, message: "Something went wrong" });
            });


        }

        res.status(200).send({ success: true, message: "Otp matched successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in verify otp",
            error
        })
    }
}

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        // validation
        if (!email || !password) {
            return res.status(400).send({
                success: false,
                message: 'email and password is required'
            })
        }

        // check user
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'Invalid email and password'
            })
        }

        const match = await comparePassword(password, user.password);

        if (!match) {
            return res.status(404).send({
                success: false,
                message: 'Invalid email and password'
            })
        }

        // token 
        // console.log("__________________");
        // console.log("__________________");
        // console.log("Login");
        // console.log(user);
        res.status(200).send({
            success: true,
            message: 'Login successfully',
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            }
        })
    } catch (error) {
        res.status(500).send({
            status: false,
            message: 'Error in login',
            error
        })
    }
}