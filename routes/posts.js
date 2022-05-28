const { json } = require("express");
const express = require("express");
const router = express.Router();
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const { isAuth } = require("../service/auth");
const Posts = require("../models/postsModel");
const User = require("../models/userModel");
// 取得貼文列表
router.get("/posts", isAuth, async function (req, res, next) {
  const timeSort = req.query.timeSort === "asc" ? "createdAt" : "-createdAt";
  const keyword =
    req.query.keyword !== undefined
      ? { content: new RegExp(req.query.keyword) }
      : {};
  const postList = await Posts.find(keyword)
    .populate({
      path: "user",
      select: "name gender avatar",
    })
    .populate({
      path: "comments",
      select: "comment user",
    })
    .sort(timeSort);
  res
    .status(200)
    .json({ message: "success", status: "success", posts: postList });
});

const checkAddParam = handleErrorAsync(async (req, res, next) => {
  const { content, user } = req.body;
  if (content === undefined) {
    return next(appError(400, "參數有缺", next));
  }
  next();
});

// 新增貼文
router.post(
  "/post",
  isAuth,
  checkAddParam,
  handleErrorAsync(async function (req, res, next) {
    const { _id } = req.user;
    const { content, image, cover } = req.body;
    const checkUser = await User.findById(_id).exec();
    if (!checkUser) {
      return next(appError(400, "使用者不存在", next));
    }
    const newPost = await Posts.create({
      content,
      image,
      user: _id,
      cover,
    });
    res
      .status(200)
      .json({ message: "success", status: "success", posts: newPost });
  })
);

const checkReviseParam = handleErrorAsync(async (req, res, next) => {
  if (user === undefined || content === undefined) {
    return next(appError(400, "參數有缺", next));
  }
});

//修改貼文
router.patch(
  "/post/:id",
  handleErrorAsync(async function (req, res, next) {
    const { id } = req.params;
    const { name, content } = req.body;
    if (name === undefined || content === undefined) {
      return next(appError(400, "參數有缺", next));
      // res.status(400).json({ message: "參數有缺", status: "fail" });
      // return;
    }
    const target = await Posts.findByIdAndUpdate(
      id,
      { name, content },
      { new: true }
    );
    if (target) {
      res
        .status(200)
        .json({ message: "success", status: "success", post: target });
    } else {
      res.status(400).json({ message: "無此id", status: "fail" });
    }
  })
);
//按讚
router.post(
  "/:id/likes",
  isAuth,
  handleErrorAsync(async () => {

  })
);

router.delete(
  "/:id/likes",
  isAuth,
  handleErrorAsync(async () => {
    
  })
);

//新增留言
router.post(
  "/post/:id/comment".isAuth,
  handleErrorAsync(async (req, res, next) => {
    const user = req.user._id;
    const post = req.params.id;
    const { comment } = req.body;
    const newComment = await Posts.create({
      post,
      user,
      comment,
    });
    res.status(201).json({
      status: "success",
      data: {
        comment: newComment,
      },
    });
  })
);

router.delete(
  "/post/:id",
  handleErrorAsync(async function (req, res, next) {
    const { id } = req.params;
    await Posts.findByIdAndDelete(id);
    res.status(200).json({ message: "success", status: "success" });
  })
);

router.delete(
  "/posts",
  handleErrorAsync(async function (req, res, next) {
    await Posts.deleteMany({});
    res.status(200).json({ message: "success", status: "success", posts: [] });
  })
);

module.exports = router;
