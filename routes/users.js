var express = require("express");
var router = express.Router();
const User = require("../models/user");
/* GET users listing. */
router.get("/", async (req, res, next) => {
  const userList = await User.find();
  res.status(200).json({ message: "success", user: userList });
});

router.post("/", async (req, res, next) => {
  try {
    const { account, password } = req.body;
    const newUser = await User.create({ account, password });
    res.status(200).json({ message: "success", user: newUser });
  } catch (error) {
    res.status(400).json({ message: "新增失敗" });
  }
});

module.exports = router;
