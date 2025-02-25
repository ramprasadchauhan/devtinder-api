const express = require('express');
const { userAuth } = require('../middleware/auth');
const ConnectionRequest = require('../models/connectionRequest.model');
const User = require('../models/user.model');

const router = express.Router();


const SAFE_USER_DATA = ["firstName", "lastName", "photoUrl", "skills", "age", "gender", "about"]

// Get all the pending connection requests for the logged in user
router.get("/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequest = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUser", SAFE_USER_DATA);
        return res.status(200).json({
            message: "data fetched successfully",
            data: connectionRequest
        });
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
})

router.get("/requests/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequest = await ConnectionRequest.find({
            $or: [{
                fromUser: loggedInUser._id,
                status: "accepted"
            }, {
                toUserId: loggedInUser._id,
                status: "accepted"
            }]
        }).populate("fromUser", SAFE_USER_DATA).populate("toUserId", SAFE_USER_DATA);

        const data = connectionRequest.map((item) => {

            if (item.fromUser._id.toString() === loggedInUser._id.toString()) {
                return item.toUserId
            }
            return item.fromUser
        })
        return res.status(200).json({
            message: "data fetched successfully",
            data
        });
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
})

router.get("/feed", userAuth, async (req, res) => {
    try {
        // user should see all the user except
        // his own card
        // ignored people
        // already connected people

        const loggedInUser = req.user;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;

        // find all the connection request (sent and received)
        const connectionRequest = await ConnectionRequest.find({
            $or: [
                {
                    fromUser: loggedInUser._id,
                },
                {
                    toUserId: loggedInUser._id,
                }
            ]
        }).select("fromUser toUserId");

        const hideUsersFromFeed = new Set()
        connectionRequest.forEach((item) => {
            hideUsersFromFeed.add(item.fromUser.toString())
            hideUsersFromFeed.add(item.toUserId.toString())
        })
        // console.log(hideUsersFromFeed)

        const users = await User.find({
            $and: [{ _id: { $nin: Array.from(hideUsersFromFeed) } }, { _id: { $ne: loggedInUser._id } }]
        }).select(SAFE_USER_DATA).skip(skip).limit(limit);
        // console.log("users", users)
        res.status(200).json({
            message: "data fetched successfully",
            data: users
        });

    } catch (error) {
        console.log("error in feed api ", error.message)
        return res.status(401).json({ message: error.message });
    }
})



module.exports = router;
