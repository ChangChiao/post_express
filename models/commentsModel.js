const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: [true, "留言不可以為空"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "留言一定要有作者"],
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: "Posts",
    required: [true, "留言一定要有對應文章"],
  },
});

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name id avatar",
  });
  next();
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
