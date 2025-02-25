const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const userAuth = async (req, res, next) => {
   // Read the token from request cookie
   // Validate the token
   // Find the user by id from token
   try {
      const cookie = await req.cookies;
      const { token } = cookie
      if (!token) {
         return res.status(401).json({
            message: "Unauthorized"
         })
      }
      const decoded = await jwt.verify(token, process.env.JWT_SECRET)
      const { id } = decoded
      const user = await User.findById(id)

      //  console.log("user", user)
      if (!user) {
         throw new Error("User not found")
      }
      req.user = user
      next()
   } catch (error) {
      console.log("error in auth middleware ", error.message)
      return res.status(400).json({
         message: error.message
      })
   }
}
module.exports = { userAuth }