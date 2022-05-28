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
      select: true,
    },
    replies: {
      type: Array,
      default: [],
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "post",
  localField: "_id",
});

const Posts = mongoose.model("Posts", postSchema);
module.exports = Posts;
