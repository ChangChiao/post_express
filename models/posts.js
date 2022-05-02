const mongoose = require("mongoose");
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "貼文ID未填寫"],
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
      default: Date.now,
      select: true
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
