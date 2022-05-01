const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "用戶名稱未填寫"],
  },
  password: {
    type: String,
  },
  nickName: {
    type: String,
  },
  gender: {
    type: Number,
    default: 0,
  },
  avatar: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    // select: false
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
