const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const router = express.Router();
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const { isAuth, generateSendJWT } = require("../service/auth");
const User = require("../models/userModel");
const Posts = require("../models/postsModel");

router.post(
  "/sign_up",
  handleErrorAsync(async (req, res, next) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return next(appError(400, "欄位資料有缺", next));
    }
    // if (password !== confirmPassword) {
    //   return next(appError(400, "密碼不一致", next));
    // }

    if (!validator.isLength(name, { min: 2 })) {
      return next(appError(400, "暱稱不得少於兩個字元", next));
    }
    if (!validator.isLength(password, { min: 8 })) {
      return next(appError(400, "密碼長度不得少於8碼", next));
    }
    if (
      !validator.matches(password, /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,20}$/)
    ) {
      return next(appError(400, "密碼必須為英數混合", next));
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
      name,
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
    if (!user) {
      return next(appError(401, "您的帳號或密碼不正確", next));
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return next(appError(401, "您的帳號或密碼不正確", next));
    }
    generateSendJWT(user, 200, res);
  })
);

router.patch(
  "/update_password",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return next(appError(400, "密碼不一致", next));
    }
    if (
      !validator.matches(password, /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,20}$/)
    ) {
      return next(appError(400, "密碼必須為英數混合", next));
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

//取得他人資訊
router.get("/profile/:id", isAuth, async (req, res, next) => {
  const _id = req.params.id;
  const user = await User.findById(_id);
  res.status(200).json({
    status: "success",
    user,
  });
});

router.patch(
  "/profile",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const { name, gender, avatar } = req.body;
    const updateUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, gender, avatar },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      status: "success",
      user: updateUser,
    });
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return next(appError(400, "密碼不一致", next));
    }
    if (!validator.isLength(name, { min: 2 })) {
      return next(appError(400, "暱稱不得少於兩個字元", next));
    }
    newPassword = await bcrypt.hash(password, 12);
    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword,
    });
    generateSendJWT(user, 200, res);
  })
);

//取得按讚列表
router.get(
  "/like_list",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const likeList = await Posts.find({
      likes: { $in: [req.user.id] },
    }).populate({
      path: "user",
      select: "name avatar",
    });

    res.status(200).json({
      status: "success",
      likeList,
    });
  })
);

//取得追蹤列表
router.get(
  "/following",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const _id = req.user._id;
    // const following = await User.findById(_id).select("following")
    const following = await User.aggregate([
      { $match: { _id: req.user._id } },
      {
        $project: { following: 1 },
      },
      {
        $unwind: "$following",
      },
      {
        $lookup: {
          from: "users",
          // localField: "following.user",
          // foreignField: "_id",
          let: {
            user: "$following.user",
          },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$user"] } } },
            {
              $project: { avatar: 1, name: 1, _id: 0 },
            },
          ],
          as: "follower",
        },
      },
      {
        $unwind: "$follower",
      },
      {
        $replaceRoot: {
          newRoot: {
            user: "$follower",
            createdAt: "$following.createdAt",
          },
        },
      },
    ]);
    console.log("following---", following);
    res.status(200).json({ message: "success", status: "success", following });
  })
);

//追蹤
router.post(
  "/:id/follow",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    if (req.params.id === req.user._id) {
      return next(appError(400, "您無法追蹤自己", next));
    }
    const userExist = await User.findById(req.params.id).exec();
    if(!userExist){
      return next(appError(400, "沒有這個使用者喔", next));
    }
    await User.updateOne(
      {
        _id: req.user._id,
        "following.user": { $ne: req.params.id },
      },
      {
        $addToSet: { following: { user: req.params.id } },
      }
    );
    await User.updateOne(
      {
        _id: req.params.id,
        "followers.user": { $ne: req.user._id },
      },
      {
        $addToSet: { followers: { user: req.user._id } },
      }
    );

    res.status(200).json({
      status: "success",
      message: "追蹤成功！",
    });
  })
);

// 退追蹤
router.delete(
  "/:id/unfollow",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    if (req.params.id === req.user._id) {
      return next(appError(400, "您無法取消追蹤自己", next));
    }
    const userExist = await User.findById(req.params.id).exec();
    if(!userExist){
      return next(appError(400, "沒有這個使用者喔", next));
    }
    await User.updateOne(
      {
        _id: req.user.id,
      },
      {
        $pull: { following: { user: req.params.id } },
      }
    );
    await User.updateOne(
      {
        _id: req.params.id,
      },
      {
        $pull: { followers: { user: req.user._id } },
      }
    );
    res.status(200).json({
      status: "success",
      message: "成功取消追蹤",
    });
  })
);

//TODO for test

router.get("/chat-record", isAuth, async (req, res, next) => {
  const targetUser = await User.findById(req.user);
  const chatRecord = targetUser.chatRecord;
  res.status(200).json({ message: "success", chatRecord });
});

//for test
router.get("/all", async (req, res, next) => {
  const userList = await User.find();
  res.status(200).json({ message: "success", user: userList });
});

module.exports = router;
