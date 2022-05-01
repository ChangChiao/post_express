const mongoose = require("mongoose");
const postSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "貼文姓名未填寫"],
    },
    content: {
      type: String,
      required: [true, "Content 未填寫"],
    },
    cover: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      // select: false
    },
    replies: {
      type: Array,
      default: []
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
  }
);

const Posts = mongoose.model("Posts", postSchema);
module.exports = Posts;
