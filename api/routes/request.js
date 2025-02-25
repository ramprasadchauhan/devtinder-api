const express = require("express")
const { userAuth } = require("../middleware/auth");
const ConnectionRequestModel = require("../models/connectionRequest.model");
const User = require("../models/user.model");

const router = express.Router()

// send connection request


router.post("/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUser = req.user._id
        const toUserId = req.params.toUserId
        const status = req.params.status

        const allowedStatus = ["ignored", "interested"]
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status type"
            })
        }

        // user should not send request to himself
        // if (fromUser.toString() === toUserId) {
        //     return res.status(400).json({
        //         message: "You cannot send request to yourself"
        //     })
        // }

        // check the toUaserId is exist or not in database 
        const toUser = await User.findById(toUserId)
        if (!toUser) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        // IF  there is already a connection request from the user to the toUserId
        const existingConnectionRequest = await ConnectionRequestModel.findOne({
            $or: [

                { fromUser, toUserId },
                { fromUser: toUserId, toUserId: fromUser }
            ]
        })
        if (existingConnectionRequest) {
            return res.status(400).json({
                message: "Connection request already exists"
            })
        }
        const connectionRequest = new ConnectionRequestModel({
            fromUser,
            toUserId,
            status
        })
        const data = await connectionRequest.save()
        return res.status(200).send({ message: `${req.user.firstName} is ${status} in ${toUser.firstName}`, data })
    } catch (error) {
        console.log("error in connection request", error.message)
        res.status(400).json({
            message: error.message
        })
    }
})
router.post("/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        // loggedInUser should be the user who sent the request
        const requestId = req.params.requestId
        const status = req.params.status
        // validate status
        const allowedStatus = ["accepted", "rejected"]
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status type"
            })
        }
        const connectionRequest = await ConnectionRequestModel.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        })

        if (!connectionRequest) {
            return res.status(404).json({
                message: "Connection request not found"
            })
        }
        connectionRequest.status = status
        const data = await connectionRequest.save()
        return res.status(200).send({ message: `Connection request is ${status}`, data })
    } catch (error) {
        console.log("error in connection request review", error.message)
        res.status(400).json({
            message: error.message
        })
    }
})



module.exports = router