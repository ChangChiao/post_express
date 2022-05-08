const { json } = require("express");
const express = require("express");
const router = express.Router();
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const Posts = require("../models/posts");
const User = require("../models/user");
router.get("/", async function (req, res, next) {
  const timeSort = req.query.timeSort === "asc" ? "createdAt" : "-createdAt";
  const keyword =
    req.query.keyword !== undefined
      ? { content: new RegExp(req.query.keyword) }
      : {};
  const postList = await Posts.find(keyword)
    .populate({
      path: "user",
      select: "userName gender avatar",
    })
    .sort(timeSort);
  res
    .status(200)
    .json({ message: "success", status: "success", posts: postList });
});

const checkAddParam = handleErrorAsync(async (req, res, next) => {
  const { content, user } = req.body;
  if (user === undefined || content === undefined) {
    return next(appError(400, "參數有缺", next));
  }
  next()
});

router.post(
  "/",
  checkAddParam,
  handleErrorAsync(async function (req, res, next) {
    const { content, image, cover, user } = req.body;
    const newPost = await Posts.create({
      content,
      image,
      user,
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

router.patch(
  "/:id",
  handleErrorAsync(async function (req, res, next) {
    const { id } = req.params;
    const { name, content } = req.body;
    if (name === undefined || content === undefined) {
      return next(appError(400, '參數有缺', next))
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

router.delete(
  "/:id",
  handleErrorAsync(async function (req, res, next) {
    const { id } = req.params;
    await Posts.findByIdAndDelete(id);
    res.status(200).json({ message: "success", status: "success" });
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
