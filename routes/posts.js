const { json } = require("express");
const express = require("express");
const router = express.Router();
const Posts = require("../models/posts");
const User = require("../models/user");
router.get("/", async function (req, res, next) {
  const timeSort = req.query.timeSort === "asc" ? "createdAt" : "-createdAt";
  const keyword =
    req.query.keyword !== undefined ? { content: new RegExp(req.query.keyword) } : {};
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

router.post("/", async function (req, res, next) {
  try {
    const { content, image, likes, user } = req.body;
    if (user === undefined || content === undefined) {
      res.status(400).json({ message: "參數有缺", status: "fail" });
      return;
    }
    const newPost = await Posts.create({
      content,
      image,
      user,
      likes,
    });
    res
      .status(200)
      .json({ message: "success", status: "success", posts: newPost });
  } catch (error) {
    res.status(400).json({ message: "新增失敗", status: "fail" });
  }
});

router.patch("/:id", async function (req, res, next) {
  try {
    const { id } = req.params;
    const { name, content } = req.body;
    if (name === undefined || content === undefined) {
      res.status(400).json({ message: "參數有缺", status: "fail" });
      return;
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
  } catch (error) {
    res.status(400).json({ message: "修改失敗", status: "fail" });
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    const { id } = req.params;
    await Posts.findByIdAndDelete(id);
    res.status(200).json({ message: "success", status: "success" });
  } catch (error) {
    res.status(400).json({ message: "無此id", status: "fail" });
  }
});

router.delete("/", async function (req, res, next) {
  try {
    await Posts.deleteMany({});
    res.status(200).json({ message: "success", status: "success", posts: [] });
  } catch (error) {
    res.status(400).json({ message: "刪除失敗", status: "fail" });
  }
});

module.exports = router;
