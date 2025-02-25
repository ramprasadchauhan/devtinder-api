const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // reference to User model
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // reference to User model
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: `{VALUE} is incorrect status type`
        }
    }
}, { timestamps: true })

connectionRequestSchema.index({ fromUser: 1, toUserId: 1 }, { unique: true })


connectionRequestSchema.pre("save", function (next) {
    const connectionRequest = this;
    // check if he fromUserId is same as toUserId
    if (connectionRequest.fromUser.toString() === connectionRequest.toUserId.toString()) {
        throw new Error("You cannot send a connection request to yourself");
    }
    return next();
})

// connectionRequest



const ConnectionRequest = new mongoose.model("ConnectionRequest", connectionRequestSchema)

module.exports = ConnectionRequest;