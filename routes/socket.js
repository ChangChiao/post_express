const { Server } = require("socket.io");
module.exports = function (server) {
  const io = new Server(server, {
    path: "/socket.io/",
    cors: {
      origin: "*",
    },
  });

  //建立連接
  io.of('/chat').on("connection", (socket) => {
    console.log("socket connect", socket.id);
    // const qtd = socket.client.conn.server.clientsCount;
    // socket.join('KPL') //加入房間
    // 監聽 client發來的訊息
    socket.on("sendMsg", (msg) => {
      // socket.to('KPL').emit('talk', msg)
      socket.emit("receiveMsg", msg);
      console.log(`傳來的訊息`, msg);
    });
    //斷開連接
    socket.on("disconnect", () => {});
  });

  io.of('/chat').on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  return io; // so it can be used in app.js ( if need be )
};
