const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const userAuth = async(req, res, next) => {
   // Read the token from request cookie
  try {
     const cookie = await req.cookies;
     const{ token} = cookie  
     if(!token){
      throw new Error("Invalid Token, please login")
     }
     const decoded = await jwt.verify(token, process.env.JWT_SECRET)
     const {id} = decoded
     const user = await User.findById(id)
    
    //  console.log("user", user)
     if(!user){
        throw new Error("User not found")
     }
     req.user = user
     next()
  } catch (error) {
    console.log("error in auth middleware ", error.message)
    return res.status(400).json({
        message : error.message
    })
  }
}
module.exports = { userAuth}