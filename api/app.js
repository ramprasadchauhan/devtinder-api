const express = require("express");
const connectDB = require("./config/database.js");
const User = require("./models/user.model.js");
const { validateSignUpData } = require("./utils/validation.js");
const bcrypt = require('bcryptjs');
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middleware/auth.js");

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


app.post("/signup", async (req, res) => {
    try {
    // validation of data
    validateSignUpData(req)
    const {firstName, lastName, emailId, password} = req.body
    //Encrypt the password
    const passwordHash = await bcrypt.hashSync(password, 10)
    console.log(passwordHash)
    // create a new user object
      const user = new User(
     { firstName, lastName, emailId, password: passwordHash }
    );

        await user.save()
        res.send("User created successfully");
    } catch (error) {
        console.log("error in signup api", error.message)
        res.status(400).json({
            message: error.message
        })
    }
  
})

//  login 

app.post("/login", async(req, res) => {
    try {
        const {emailId, password} = req.body;
        if(!emailId || !password){
            return res.status(400).json({
                message: "please enter email and password"
            })
        }
     const user =  await User.findOne({
        emailId
     })
     if(!user){
        throw new Error("Invalid credentials")
     }
     
        const isPasswordValid = await bcrypt.compareSync(password, user.password )
        if(!isPasswordValid){
            throw new Error("Email or password is incorrect")
         }
         // create JWT Token
         const token = await user.getJWT()
         console.log(token)
         res.cookie("token", token,  { expires: new Date(Date.now() + 8*60*60*1000 )})
         return res.status(200).json({
            message: "User login successfully"
         })
    } catch (error) {
        console.log("error in login api", error.message)
        res.status(400).json({
            message: error.message
        })
    }
} )

// profile

app.get("/profile", userAuth,  async(req, res) => {

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
} )

// send connection request

app.post("/sendConnectionRequest", userAuth, async(req, res) => {
    try {
        const user = req.user
        console.log(user)
        console.log(user.firstName + " connection request sended")
        return res.status(200).send( user.firstName + "connection request sended")
    } catch (error) {
        console.log("error in connection request", error.message)
        res.status(400).json({
            message: error.message
        })
    }
} )

// get user by email

app.get("/user", userAuth, async(req, res) => {
  try {
      const userEmail = req.body.emailId
      const data = await User.findOne({
          emailId: userEmail
      })
      console.log("data", data)
      if(data){
          return res.status(200).json({
              data
          })
      } else if(!data){
          return res.status(404).json({
            message: "User not found!"
          })
      }
    
  } catch (error) {
    console.log("error in get user", error.message)
    return res.status(500).send("Something went wrong")
  }
} )

// Feed api - GET /feed get all usser from database

app.get("/feed", userAuth, async(req, res) => {
    try {
        const data =   await User.find({})
        return res.status(200).json({
            data
        })
    } catch (error) {
        console.log("error in feed api", error.message)
        return res.status(500).json({
            message: error.message
        })
    }
 
})

// Delete user from database

app.delete("/user", async(req, res) => {
    const userId = req.body.userId;
    try {
        await User.findByIdAndDelete(userId)
        res.status(200).send("user deleted successfully")
    } catch (error) {
        console.log("error in delete user api", error.message)
        return res.status(500).json({
            message: error.message
        })
    }
})

// update user data

app.patch("/user/:userId", async(req, res) => {
   
    try {
        const userId = req.params?.userId;
        const data = req.body
        const ALLOWED_UPDATE = [
            "photoUrl", "about", "gender", "age", "skills"
        ]
        const isUpdateAllowed = Object.keys(data).every(k => ALLOWED_UPDATE.includes(k))
        if(!isUpdateAllowed){
           return res.status(400).send("Update is not allowed")
        }
      const user =  await User.findByIdAndUpdate(userId, data, {
        runValidators: true
      } )
        res.status(200).json({
            message: "user updated successfully",
            data: user
        })
    } catch (error) {
        console.log("error in user update api", error.message)
        return res.status(500).send("Update failed" + error.message)
    }
})

// update by email 

app.patch("/user-email", async(req, res) => {
    try {
        const emailId = req.body.emailId;
        const user = req.body
        const data = await User.findOneAndUpdate({emailId} , user, {
            returnDocument: "after"
        } )
        if(!data){
            return res.status(400).send("No data found")
        }
        return res.status(200).json({
            message: "user data updated successfully",
            data
        })
    } catch (error) {
        console.log("error in user update by email api", error.message)
        return res.status(500).json({
            message: error.message
        })
    
    }
} )

connectDB().then(() => {
    console.log("Database connected successfully");
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}).catch((err) => {
    console.log("Database connection failed");
});