 const adminAuth = (req, res, next) => {
    console.log("admin auth is checked")
    const token = "xyzabcd";
    const isAdminAuthorized = token === "xyz";
    if(!isAdminAuthorized){
        res.status(401).send("Unauthorized request")
    } else {
        next()
    }
}

const userAuth = (req, res, next) => {
    console.log("user auth is checked")
    const token = "xyz";
    const isAdminAuthorized = token === "xyz";
    if(!isAdminAuthorized){
        res.status(401).send("Unauthorized user request")
    } else {
        next()
    }
}
module.exports = {adminAuth, userAuth}