const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const router = express.Router();
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const { isAuth, generateSendJWT } = require("../service/auth");
const User = require("../models/userModel");

router.post(
  "/sign_up",
  handleErrorAsync(async (req, res, next) => {
    const { email, password, userName } = req.body;
    if (!email || !password || !userName) {
      return next(appError(400, "欄位資料有缺", next));
    }
    // if (password !== confirmPassword) {
    //   return next(appError(400, "密碼不一致", next));
    // }

    if (!validator.isLength(password, { min: 8 })) {
      return next(appError(400, "密碼長度不得少於8碼", next));
    }

    if (!validator.isEmail(email)) {
      return next(appError(400, "email格式錯誤", next));
    }

    const user = await User.findOne({ email });
    if (user) return next(appError(400, "該email已被註冊", next));

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email,
      password: hashPassword,
      userName,
    });
    generateSendJWT(newUser, 201, res);
  })
);

router.post(
  "/sign_in",
  handleErrorAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(appError(400, "帳密不得為空", next));
    }
    //密碼取出比對
    const user = await User.findOne({ email }).select("+password");
    if(!user){
      return next(appError(401, "您的帳號或密碼不正確", next));
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return next(appError(401, "您的帳號或密碼不正確", next));
    }
    generateSendJWT(user, 200, res);
  })
);

router.post(
  "/update_password",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return next(appError(400, "密碼不一致", next));
    }
    newPassword = await bcrypt.hash(password, 12);
    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword,
    });
    generateSendJWT(user, 200, res);
  })
);

router.get("/profile", isAuth, (req, res, next) => {
  res.status(200).json({
    status: "success",
    user: req.user,
  });
});

router.patch(
  "/profile",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const { userName, gender, avatar } = req.body;
    const updateUser = await User.findByIdAndUpdate(
      req.user._id,
      { userName, gender, avatar },
      { new: true }
    );
    res.status(200).json({
      status: "success",
      user: updateUser,
    });
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return next(appError(400, "密碼不一致", next));
    }
    newPassword = await bcrypt.hash(password, 12);
    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword,
    });
    generateSendJWT(user, 200, res);
  })
);

//TODO for test

router.get("/chat-record", isAuth, async (req, res, next) => {
  const targetUser = await User.findById(req.user)
  const chatRecord = targetUser.chatRecord;
  res.status(200).json({ message: "success", chatRecord });
});


//for test
router.get("/all", async (req, res, next) => {
  const userList = await User.find();
  res.status(200).json({ message: "success", user: userList });
});

module.exports = router;
