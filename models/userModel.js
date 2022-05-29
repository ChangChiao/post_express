const mongoose = require("mongoose");

const chatRecord = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.ObjectId,
    ref: "ChatRoom",
    // required: true,
    // unique: true
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "請輸入您的信箱"],
      unique: true,
      lowercase: true,
      select: false,
    },
    password: {
      required: [true, "請輸入您的密碼"],
      type: String,
      minlength: 8,
      select: false,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    avatar: {
      type: String,
      default:
        "https://i.imgur.com/tl1mPnD.png",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    googleUUID: {
      type: String,
      select: false,
    },
    chatRecord: {
      type: [chatRecord],
      default: [],
    },
    followers: [
      {
        user: { type: mongoose.Schema.ObjectId, ref: "User" },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    following: [
      {
        user: { type: mongoose.Schema.ObjectId, ref: "User" },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    versionKey: false,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
