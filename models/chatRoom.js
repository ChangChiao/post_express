const mongoose = require("mongoose");
const chatRoomSchema = new mongoose.Schema({
  roomType: {
    type: Number,
    default: 0,
    enum: [0, 1], //0=私人 //1=公開
  },
  members: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      // last_seen: Date,
    },
  ],
  message: [
    {
      message: String,
      timestamp: Date,
      sender: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    },
  ],
  status: {
    type: Number,
    default: 0,
    enum: [0, 1, 2], //0=正常  1=禁止發言  2=解散
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
