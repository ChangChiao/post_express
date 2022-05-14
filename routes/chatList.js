const router = require("express").Router();
const User = require("../models/user");
const ChatRoom = require("../models/chatRoom");
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const { isAuth } = require("../service/auth");
router.get(
  "/room-info",
  isAuth,
  handleErrorAsync(async (req, res) => {
    const sender = req.user;
    const receiver = req.receiver;
    if (!receiver) {
      next(appError(400, "未填寫聊天對象使用者id", next))
    }
    const senderInfo = await User.findById(sender);
    const { chatRecord } = senderInfo;
    const { receiver: receiverRecord, roomId } = chatRecord.find(
      (item) => item.receiver === receiver
    );
    if (receiverRecord) {
      res.status(200).json({
        status: "success",
        roomId,
      });
    } else {
      const room = await ChatRoom.create({
        members: [sender, receiver],
      });
      await User.findByIdAndUpdate(sender, {
        $push: { chatRecord: { roomId: room._id, receiver } },
      });
      await User.findByIdAndUpdate(receiver, {
        $push: { chatRecord: { roomId: room._id, receiver: sender } },
      });
      res.status(200).json({
        status: "success",
        roomId: room._id,
      });
    }
  })
);
module.exports = router;
