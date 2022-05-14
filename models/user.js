const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
  },
  account: {
    type: String,
    required: [true, "用戶帳號未填寫"],
    unique: true,
    select: false,
  },
  password: {
    required: [true, "用戶密碼未填寫"],
    type: String,
    minlength: 8,
    select: false,
  },
  googleUUID: {
    type: String,
    unique: true,
    select: false,
  },
  gender: {
    type: String,
    enum: ['male', 'female']
  },
  avatar: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
