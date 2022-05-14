const router = require("express").Router();
const User = require("../models/user");
const ChatRoom = require("../models/chatRoom");
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const { isAuth } = require("../service/auth");
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
    const { receiver: receiverRecord, room } =
      queryResult?.chatRecord.find(
        (item) => item.receiver.toString() === receiver
      ) || {};
    console.log("sender", sender);
    console.log("receiverRecord", receiverRecord);
    if (receiverRecord) {
      res.status(200).json({
        status: "success",
        room,
      });
    } else {
      const newRoom = await ChatRoom.create({
        members: [sender, receiver],
      });
      await User.findByIdAndUpdate(sender, {
        $push: { chatRecord: { room: newRoom._id, receiver: receiver } },
      });
      await User.findByIdAndUpdate(receiver, {
        $push: { chatRecord: { room: newRoom._id, receiver: sender } },
      });
      res.status(200).json({
        status: "success",
        room: newRoom._id,
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
    const test = await User.findById(req.user._id);
    console.log("test", test);
    const queryResult = await User.findById(req.user._id)
      .populate({
        path: "chatRecord",
        populate: [
          {
            path: "room",
            select: "messages -_id",
            perDocumentLimit: 1,
            options: {
              limit: 2,
            },
          },
          { path: "receiver", select: "userName avatar -_id" },
        ],
      })
      .select("chatRecord");
    // const queryResult = await User.findById(req.user._id)
    // .populate({
    //   path: "chatRecord",
    //   populate:
    //     { path: "receiver", select: "userName avatar -_id" },
    // })
    // .select("chatRecord");
    // queryResult.chatRecord.forEach(element => {

    // });
    // const lastMessage = await ChatRoom.findById(queryResult.roomId).slice('messages', 1)
    // queryResult.chatRecord.lastMessage = lastMessage || {}
    // console.log("lastMessage", lastMessage);
    // console.log("queryResult", queryResult);
    res
      .status(200)
      .json({ status: "success", chatRecord: queryResult.chatRecord });
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
