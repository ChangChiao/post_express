const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    userName: {
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
      default: "male"
    },
    avatar: {
      type: String,
      default: "https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/14.jpg",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    googleUUID: {
      type: String,
      select: false,
    },
  },
  {
    versionKey: false,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
