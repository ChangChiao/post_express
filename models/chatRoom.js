const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  // last_seen: Date,
});

const ChatRoomSchema = new mongoose.Schema({
  roomType: {
    type: Number,
    default: 0,
    enum: [0, 1], //0=私人 //1=公開
  },
  members: {
    type: [memberSchema],
    default: [],
  },
  messages: {
    type: [MessageSchema],
    default: [],
  },
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

const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);
module.exports = ChatRoom;
