const express = require("express")
const { userAuth } = require("../middleware/auth");

const router = express.Router()

// send connection request

router.post("/sendConnectionRequest", userAuth, async(req, res) => {
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


module.exports = router