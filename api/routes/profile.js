const express = require("express")
const { userAuth } = require("../middleware/auth");
const User = require("../models/user.model");
const { validateEditProfileData } = require("../utils/validation");
const router = express.Router()

// profile

router.get("/", userAuth,  async(req, res) => {

    try {
     /*
      const cookie = req.cookies;
     
      const {token} = cookie 
      if(!token){
         return res.status(400).send("Invalid Token, Please login")
      }
      // validate token
      const decoded = jwt.verify(
          token, process.env.JWT_SECRET
      )
     const {id} = decoded
    const userData =  await User.findById(id)
    if(!userData){
     throw new Error("User not exist")
    }
    console.log("the logged in user is", userData)
    const {password, ...rest} = userData._doc;
  //   console.log("Raw user data:",userData._doc); 
      res.send(rest)
      */
     const user = req.user
     if(!user) {
         throw new Error("User not exist")
     }
     const {password, ...rest} = user._doc;
     res.send(rest)
    } catch (error) {
     console.log("error in profile api", error.message)
     res.status(400).json({
         message: error.message
     })
    }
 })

router.patch("/edit", userAuth, async(req, res) => {
   try {
     console.log(req.user)
     const data = req.body
     if(!validateEditProfileData(req)){
        throw new Error("Invalid edit request")
     }
     const user = await User.findByIdAndUpdate(req.user._id, data, {
        returnDocument: "after"
     })
     res.send(user)
   } catch (error) {
    console.log("error in edit profille", error.message)
    return res.status(400).json({
        error: error.message
    })
   }
})

 module.exports = router
