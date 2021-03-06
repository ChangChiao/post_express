const router = require("express").Router();
const User = require("../models/userModel");
const ChatRoom = require("../models/chatRoomModel");
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const { isAuth } = require("../service/auth");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//取得聊天室id
router.post(
  "/room-info",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const sender = req.user._id.toString();
    const receiver = req.body.receiver;
    if (!receiver) {
      return next(appError(400, "未填寫聊天對象使用者id", next));
    }
    if (sender === receiver) {
      return next(appError(400, "自己不能跟自己聊天！", next));
    }
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return next(appError(400, "沒有這個人喔", next));
    }
    const queryResult = await User.findById(sender).select("chatRecord");
    const { receiver: receiverRecord, roomId } =
      queryResult?.chatRecord.find(
        (item) => item.receiver.toString() === receiver
      ) || {};
    const { name, avatar, _id } = receiverUser;
    //已經有聊天記錄就直接回傳id
    if (receiverRecord) {
      res.status(200).json({
        status: "success",
        roomId,
        name,
        avatar,
        _id,
      });
    } else {
      //沒有聊天記錄就新建房間
      const newRoom = await ChatRoom.create({
        members: [ObjectId(sender), ObjectId(receiver)],
      });
      console.log("newRoom", newRoom);
      await User.findByIdAndUpdate(sender, {
        $push: { chatRecord: { roomId: newRoom._id, receiver: receiver } },
      });
      await User.findByIdAndUpdate(receiver, {
        $push: { chatRecord: { roomId: newRoom._id, receiver: sender } },
      });
      res.status(200).json({
        status: "success",
        roomId: newRoom._id,
        name,
        avatar,
        _id,
      });
    }
  })
);

// TODO for test
router.delete(
  "/chat-record/:id",
  handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    await User.findOneAndUpdate({ _id: id }, { chatRecord: [] });
    res.status(200).json({ message: "success" });
  })
);

// TODO for test
router.delete(
  "/all/chat-record",
  handleErrorAsync(async (req, res, next) => {
    // const { id } = req.params;
    await User.updateMany({}, { $set: { chatRecord: [] } });
    const users = await User.find()
    res.status(200).json({ message: "success", users });
  })
);

//TODO for test
router.delete(
  "/chat-record",
  handleErrorAsync(async (req, res, next) => {
    await ChatRoom.deleteMany({});
    res.status(200).json({ message: "success" });
  })
);

//TODO for test

router.get("/all", async (req, res, next) => {
  const chatRecord = await ChatRoom.find();
  res.status(200).json({ message: "success", chatRecord: chatRecord });
});

//取得聊天記錄
router.get(
  "/chat-record",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    console.log("user._id", req.user._id);
    const queryResult = await User.aggregate([
      { $match: { _id: req.user._id } },
      {
        $project: { chatRecord: 1 },
      },
      {
        $unwind: "$chatRecord",
      },
      {
        $lookup: {
          from: "chatrooms",
          let: {
            roomId: "$chatRecord.roomId",
            chatRecord: "$chatRecord",
          },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$roomId"] } } },
            {
              $project: { messages: 1, _id: 0 },
            },
            // { $replaceRoot: { newRoot: { $mergeObjects: [ $message , $$ROOT] } } }
            {
              $replaceRoot: {
                newRoot: { message: { $slice: ["$messages", -1] } },
              },
            },
          ],
          as: "message",
        },
      },
      {
        $lookup: {
          from: "users",
          let: {
            receiverId: "$chatRecord.receiver",
            chatRecord: "$chatRecord",
          },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$receiverId"] } } },
            {
              $project: { avatar: 1, name: 1, _id: 0 },
            },
          ],
          as: "user",
        },
      },
      {
        $unwind: "$message",
      },
      {
        $unwind: "$user",
      },
      {
        $replaceRoot: {
          newRoot: {
            message: "$message.message",
            avatar: "$user.avatar",
            name: "$user.name",
            roomId: "$chatRecord.roomId",
          },
        },
      },
    ]);
    // const [ queryResult ] = await User.aggregate([
    //   { $match: { _id: req.user._id } },
    //   {
    //     $project: { chatRecord: 1 },
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "chatRecord.receiver",
    //       foreignField: "_id",
    //       as: "receivers",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "chatrooms",
    //       localField: "chatRecord.roomId",
    //       foreignField: "_id",
    //       as: "room",
    //     },
    //   },
    //   {
    //     $addFields: {
    //       receivers: "$$REMOVE",
    //       room: "$$REMOVE",
    //       chatRecord: {
    //         $map: {
    //           input: "$room",
    //           as: "ele",
    //           in: {
    //             $mergeObjects: [
    //               {
    //                 roomId: "$$ele._id",
    //                 message: { $slice: ["$$ele.messages", -1] },
    //               },
    //               {
    //                 $arrayElemAt: [
    //                   {
    //                     $filter: {
    //                       input: "$receivers",
    //                       as: "receiver",
    //                       cond: { $in: ["$$receiver._id", "$$ele.members"] },
    //                     },
    //                   },
    //                   0,
    //                 ],
    //               },
    //             ],
    //           },
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $project: { "chatRecord.password": 0, "chatRecord.email": 0, "chatRecord.createdAt": 0, 'chatRecord.chatRecord':0},
    //   },
    // ]);
    res.status(200).json({ status: "success", chatRecord: queryResult });
  })
);

module.exports = router;
