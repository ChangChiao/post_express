const router = require("express").Router();
const User = require("../models/user");
const ChatRoom = require("../models/chatRoom");
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const { isAuth } = require("../service/auth");
const mongoose = require("mongoose");
const { db } = require("../models/user");
router.post(
  "/room-info",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const sender = req.user._id;
    const receiver = req.body.receiver;
    if (!receiver) {
      return next(appError(400, "未填寫聊天對象使用者id", next));
    }
    if (sender === receiver) {
      return next(appError(400, "自己不能跟自己聊天！", next));
    }
    const queryResult = await User.findById(sender).select("chatRecord");
    console.log("chatRecord", queryResult?.chatRecord);
    console.log("receiver", receiver);
    const { receiver: receiverRecord, roomId } =
      queryResult?.chatRecord.find(
        (item) => item.receiver.toString() === receiver
      ) || {};
    console.log("sender", sender);
    console.log("receiverRecord", receiverRecord);
    if (receiverRecord) {
      res.status(200).json({
        status: "success",
        roomId,
      });
    } else {
      const newRoom = await ChatRoom.create({
        members: [sender, receiver],
      });
      await User.findByIdAndUpdate(sender, {
        $push: { chatRecord: { roomId: newRoom._id, receiver: receiver } },
      });
      await User.findByIdAndUpdate(receiver, {
        $push: { chatRecord: { roomId: newRoom._id, receiver: sender } },
      });
      res.status(200).json({
        status: "success",
        roomId: newRoom._id,
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

router.post(
  "/chat-record",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    // const queryResult = await User.findById(req.user._id)
    //   .populate({
    //     path: "chatRecord",
    //     populate: [
    //       {
    //         path: "room",
    //         select: "messages -_id",
    //         perDocumentLimit: 1,
    //         options: {
    //           limit: 2,
    //         },
    //       },
    //       { path: "receiver", select: "userName avatar -_id" },
    //     ],
    //   })
    //   .select("chatRecord");
    const ObjectId = mongoose.Types.ObjectId;
    const test = await User.aggregate([
      { $match: { _id: req.user._id } },
      {
        $project: { chatRecord: 1 },
      },
      // {
      //   $unwind: { path: "$chatRecord", preserveNullAndEmptyArrays: true },
      // },
      {
        $lookup: {
          from: "users",
          localField: "chatRecord.receiver",
          foreignField: "_id",
          as: "receivers",
        },
      },
      {
        $lookup: {
          from: "chatrooms",
          localField: "chatRecord.roomId",
          foreignField: "_id",
          as: "room",
        },
      },
      {
        $addFields: {
          // receiver: {
          //   userName: "$person.userName",
          //   avatar: "$person.avatar",
          // },
          // receiver: "$$REMOVE",
          // room: "$$REMOVE",
          chatRecord: {
            $map: {
              input: "$room",
              as: "ele",
              in: {
                $mergeObjects: [
                  {
                    roomId: "$$ele._id",
                    message: { $slice: ["$$ele.messages", -1] },
                  },
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$receivers",
                          as: "receiver",
                          // cond: {
                          //   $setIsSubset: [
                          //     ["$$receiver._id"],
                          //     "$$ele.members"
                          //   ]
                          // }
                          cond: { $eq: ["$$receiver.userName", "mary10"] },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
          // chatRecord: {
          //   $map: {
          //     input: "$room",
          //     as: "ele",
          //     in: {
          //       receiver: {
          //         $cond: [ {"$receiver": []} ]
          //       },
          //       roomId: "$$ele._id",
          //       message: { $slice: ["$$ele.messages", -1] },
          //     },
          //   },
          // },
        },
      },
      // { $unwind: "$chatRecord" },
    ]);
    console.log("test", test);
    console.log("test2", test[0]);
    const queryResult = await User.findById(req.user._id)
      .populate({
        path: "chatRecord",
        populate: { path: "receiver", select: "userName avatar -_id" },
      })
      .select("chatRecord");

    // queryResult.chatRecord.a

    // const roomIdArr = queryResult.chatRecord.map((ele) => ele.roomId);
    // const lastMessage = await ChatRoom.find(
    //   { _id: { $in: roomIdArr } },
    //   { messages: { $slice: 1 }, roomType: 0, members: 0, status: 0 }
    // );

    // queryResult.chatRecord.forEach(element => {

    // });
    // queryResult.chatRecord.lastMessage = lastMessage || {}
    // console.log("lastMessage", lastMessage);
    // console.log("queryResult", queryResult);
    res
      .status(200)
      .json({ status: "success", chatRecord: queryResult.chatRecord, test });
  })
);

module.exports = router;
const io = require("../bin/www").io;

// io.on("connection", (socket) => {
//   io.emit("join", 'hi!!');
// //   socket.on("chat message", (msg) => {
// //     io.emit("chat message", msg);
// //   });
// });
const router = require("express").Router();
router.get("/", (req, res) => {
  const io = req.app.get("socketio"); //Here you use the exported socketio module
  // console.log('ioooo', io);
  // console.log(io.client.conn.server.clientsCount);
  // io.emit("join", 111);
  // io.emit("new-user", { qtd: io.client.conn.server.clientsCount });
  res.status(200).json({ msg: "server up and running" });
});
module.exports = router;
