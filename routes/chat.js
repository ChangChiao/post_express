// const io = require("../bin/www").io;

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
const io = require("../bin/www").io;

io.on("connection", (socket) => {
  io.emit("join", 'hi!!');
//   socket.on("chat message", (msg) => {
//     io.emit("chat message", msg);
//   });
});
