const io = require("../bin/www").io;

io.on("connection", (socket) => {
  io.emit("join", 'hi!!');
//   socket.on("chat message", (msg) => {
//     io.emit("chat message", msg);
//   });
});
