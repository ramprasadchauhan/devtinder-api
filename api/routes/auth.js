const express = require("express")
const { validateSignUpData } = require("../utils/validation")
const bcrypt = require('bcryptjs');
const User = require("../models/user.model");
const { userAuth } = require("../middleware/auth");

const router = express.Router()

router.post("/signup", async (req, res) => {
    try {
        // validation of data
        validateSignUpData(req)
        const { firstName, lastName, emailId, password } = req.body
        //Encrypt the password
        const passwordHash = bcrypt.hashSync(password, 10)

        // create a new user object
        const user = new User(
            { firstName, lastName, emailId, password: passwordHash }
        );
        const savedUser = await user.save()
        // create JWT Token
        const token = await savedUser.getJWT()
        res.cookie("token", token, { expires: new Date(Date.now() + 8 * 60 * 60 * 1000) })


        res.json({ message: "User created successfully", data: savedUser });
    } catch (error) {
        console.log("error in signup api", error.message)
        res.status(400).json({
            message: error.message
        })
    }

})

//  login 

router.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        if (!emailId || !password) {
            return res.status(400).json({
                message: "please enter email and password"
            })
        }
        const user = await User.findOne({
            emailId
        })
        if (!user) {
            throw new Error("Invalid credentials")
        }

        const isPasswordValid = user.validatePassword(password)
        if (!isPasswordValid) {
            throw new Error("Invalid credentials")
        }
        // create JWT Token
        const token = await user.getJWT()
        // console.log(token)
        res.cookie("token", token, { expires: new Date(Date.now() + 8 * 60 * 60 * 1000) })
        return res.status(200).json({
            message: "User login successfully",
            user
        })
    } catch (error) {
        console.log("error in login api", error.message)
        res.status(400).json({
            message: error.message
        })
    }
})

// logout

router.post("/logout", async (req, res) => {
    try {
        // const cookie = req.cookies;
        // console.log(cookie)
        // res.clearCookie("token", cookie)
        res.cookie("token", null, {
            expires: new Date(Date.now())
        })
        return res.status(200).send("user logout successfully")
    } catch (error) {
        console.log("error in logout api", error.message)
        res.status(400).json({
            message: error.message
        })
    }
})

module.exports = router