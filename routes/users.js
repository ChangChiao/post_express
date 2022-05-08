var express = require("express");
var router = express.Router();
const User = require("../models/user");
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
/* GET users listing. */
router.get("/", async (req, res, next) => {
  const userList = await User.find();
  res.status(200).json({ message: "success", user: userList });
});

router.post(
  "/",
  handleErrorAsync(async (req, res, next) => {
    if (!account || !password) {
      return next(appError("400", "參數有缺", next));
    }
    const newUser = await User.create({ account, password });
    res.status(200).json({ message: "success", user: newUser });
  })
);

module.exports = router;
