const validator = require("validator")
const validateSignUpData = (req) => {
    const {firstName, lastName, emailId, password} = req.body;
    if( !firstName || !lastName ){
        throw new Error("first and last name is require")
    } else if(firstName.length < 4 || firstName.length > 50){
        throw new Error("FirstName should be 4-50 charector")
    } else if(!validator.isEmail(emailId)){
        throw new Error("Email id is not valid")
    } else if(!validator.isStrongPassword(password)){
        throw new Error("Please enter strong password")
    }
}
const validateEditProfileData = (req) => {
    const allowedEditFields = [
      "firstName",
      "lastName",
      "emailId",
      "photoUrl",
      "gender",
      "age",
      "about",
      "skills",
    ];
  
    const isEditAllowed = Object.keys(req.body).every((field) =>
      allowedEditFields.includes(field)
    );
  
    return isEditAllowed;
  };
  module.exports = {
    validateSignUpData,
    validateEditProfileData
}