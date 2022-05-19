const { Server } = require("socket.io");
const ChatRoom = require("../models/chatRoomModel");
module.exports = function (server) {
  const token = socket.handshake.query.token;
  if(!token) 
  const io = new Server(server, {
    path: "/socket.io/",
    cors: {
      origin: "*",
    },
  });

  //驗證token
  io.use((socket, next)=>{
    const token = socket.handshake.query?.token
    if(!token){
      return next(new Error('請重新登入'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
      if (err) return next(new Error('請重新登入'));
      socket.decoded = decoded;
      next();
    })
  })

  //建立連接
  io.of("/chat").on("connection", (socket) => {
    console.log("socket connect", socket.id);
    //加入房間
    socket.on("joinRoom", (room) => {
      socket.join(room);
    });
    // 監聽 client發來的訊息
    socket.on("chatMessage", async (msg) => {
      const { message, sender, roomId } = msg;
      const createdAt = Date.now();
      await ChatRoom.findByIdAndUpdate(roomId, {
        $push: { messages: { sender, message, createdAt } },
      });
      //針對該房間廣播訊息
      io.to(roomId).emit("chatMessage", msg);
      console.log(`傳來的訊息`, msg);
    });
    //歷史訊息
    socket.on("history", async (info) => {
      const { lastTime, roomId } = info;
      let msgList = [];
      if (lastTime) {
        msgList = await ChatRoom.find(
          { _id: roomId },
          { messages: { $lt: new Date.now(lastTime), $slice: 30 } }
        );
      } else {
        msgList = await ChatRoom.find(
          { _id: roomId },
          { messages: { $slice: 30 } }
        );
        io.to(roomId).emit("history", msgList);
      }
    });
    //斷開連接
    socket.on("disconnect", () => {
    });
  });

  //錯誤處理
  socket.on('error', function(err){
    // do something with err
    socket.emit('error', err)
  });

  io.of("/chat").on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  return io;
};
