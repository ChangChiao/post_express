const { json } = require("express");
const express = require("express");
const router = express.Router();
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const { isAuth } = require("../service/auth");
const Posts = require("../models/postsModel");
const User = require("../models/userModel");
const Comment = require("../models/commentsModel");
// 取得貼文列表
router.get(
  "/",
  isAuth,
  handleErrorAsync(async function (req, res, next) {
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
        select: "comment user createdAt",
      })
      .sort(timeSort);
    res
      .status(200)
      .json({ message: "success", status: "success", posts: postList });
  })
);

// 取得個人的貼文
router.get(
  "/user/:id",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const user = req.params.id;
    const userExist = await User.findById(user).exec();
    if (!userExist) {
      return next(appError(400, "沒有這個使用者喔", next));
    }
    const posts = await Posts.find({ user })
      .populate({
        path: "user",
        select: "name gender avatar",
      })
      .populate({
        path: "comments",
        select: "comment user createdAt",
      });
    res.status(200).json({ status: "success", posts });
  })
);

router.get(
  "/:id",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const _id = req.params.id;
    const post = await Posts.findById(_id);
    res.status(200).json({ status: "success", post });
  })
);

const checkAddParam = handleErrorAsync(async (req, res, next) => {
  const { content, user } = req.body;
  content && content.trim();
  if (content === undefined) {
    return next(appError(400, "參數有缺", next));
  }
  next();
});

// 新增貼文
router.post(
  "/",
  isAuth,
  checkAddParam,
  handleErrorAsync(async function (req, res, next) {
    const { _id } = req.user;
    const { content, image, cover } = req.body;
    const checkUser = await User.findById(_id).exec();
    if (!checkUser) {
      return next(appError(400, "使用者不存在", next));
    }
    content && content.trim();
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

//修改貼文
router.patch(
  "/:id",
  handleErrorAsync(async function (req, res, next) {
    const { id } = req.params;
    const { name, content } = req.body;
    if (name === undefined || content === undefined) {
      return next(appError(400, "參數有缺", next));
    }
    const userExist = await User.findById(user).exec();
    if (!userExist) {
      return next(appError(400, "沒有這個使用者喔", next));
    }
    content && content.trim();
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
  handleErrorAsync(async (req, res, next) => {
    const id = req.params.id;
    const userExist = await User.findById(id).exec();
    if (!userExist) {
      return next(appError(400, "沒有這個使用者喔", next));
    }
    await Posts.findByIdAndUpdate(
      { _id: id },
      {
        $addToSet: { likes: req.user._id },
      }
    );
    res.status(201).json({
      status: "success",
      postId: id,
      userId: req.user._id,
    });
  })
);

//取消讚
router.delete(
  "/:id/unlikes",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const id = req.params.id;
    const userExist = await User.findById(id).exec();
    if (!userExist) {
      return next(appError(400, "沒有這個使用者喔", next));
    }
    await Posts.findByIdAndUpdate(
      { _id: id },
      {
        $pull: { likes: req.user._id },
      }
    );
    res.status(200).json({
      status: "success",
      postId: id,
      userId: req.user._id,
    });
  })
);

//新增留言
router.post(
  "/:id/comment",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const user = req.user._id;
    const post = req.params.id;
    const userExist = await User.findById(user).exec();
    if (!userExist) {
      return next(appError(400, "沒有這個使用者喔", next));
    }
    const { comment } = req.body;
    if (!comment) {
      return next(appError(400, "留言不可以為空", next));
    }
    const newComment = await Comment.create({
      post,
      user,
      comment,
    });
    res.status(200).json({
      status: "success",
      data: {
        comment: newComment,
      },
    });
  })
);

router.delete(
  "/:id",
  handleErrorAsync(async function (req, res, next) {
    const { id } = req.params;
    await Posts.findByIdAndDelete(id);
    res.status(201).json({ message: "success", status: "success" });
  })
);

router.delete(
  "/",
  handleErrorAsync(async function (req, res, next) {
    await Posts.deleteMany({});
    res.status(200).json({ message: "success", status: "success", posts: [] });
  })
);

module.exports = router;
