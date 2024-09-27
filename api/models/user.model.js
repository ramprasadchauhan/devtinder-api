const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require("jsonwebtoken")
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 4,
    maxLength: 50
  },
  lastName: {
    type: String,
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
   validate(value){
    if(!validator.isEmail(value)) {
      throw new Error("Invalid email address" + value)
    }
   }
  },
  password: {
    type: String,
    required: true,
    validate(value){
      if(!validator.isStrongPassword(value)) {
        throw new Error("Please enter strong password" + value)
      }
     }
  },
  age: {
    type: Number,
    min: 18
  },
  gender: {
    type: String,
    enum: {
      values: ["male", "female", "other"],
      message: `{VALUE} is not a valid gender type`,
    },
    // validate(value) {
    //   if (!["male", "female", "others"].includes(value)) {
    //     throw new Error("Gender data is not valid");
    //   }
    // },
  },
  photoUrl: {
    type: String,
    default: "https://geographyandyou.com/images/user-profile.png",
    validate(value){
      if(!validator.isURL(value)) {
        throw new Error("Invalid photo url" + value)
      }
     }
  },
  about: {
    type: String,
    default: "This is default about user"
  },
  skills: {
    type: [String],
    validate: {
      validator: (v) => {
        return v.length <= 3
      },
      message: props => `${props.value} exceeds the maximum number of 3 skills!`
    }
  }
}, {timestamps: true})

userSchema.methods.getJWT = async function() {
  const user = this;
  const token = await jwt.sign({id: user._id},  process.env.JWT_SECRET, {
    expiresIn: "1d"
  } )
  return token
}

const UserModel = mongoose.model('User', userSchema);



module.exports = UserModel;