var express = require("express");
var path = require("path");
const mongoose = require("mongoose");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const dotenv = require("dotenv");
const errorList = require("./service/erroList");
dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

const connectDatabase = async () => {
  try {
    // mongoose.set("useNewUrlParser", true);
    await mongoose.connect(DB);
    console.log("connected to database");
  } catch (error) {
    console.log(error);
  }
};

connectDatabase();

// mongoose
//   .connect(DB)
//   .then(() => {
//     console.log("connect success");
//   })
//   .catch((error) => {
//     console.error(error.reason);
//   });

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");
const chatRouter = require("./routes/chat");
const uploadRouter = require('./routes/upload');
var app = express();

process.on("uncaughtException", (error) => {
  //等送出log後 終止該process
  console.log("error", error);
  process.exit(1);
});

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/chat", chatRouter);
app.use("/upload", uploadRouter);
app.use(postsRouter);
//404
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: "無此路由",
  });
});

//prd env error
const resErrorPrd = (error, res) => {
  const { isOperational, statusCode, message } = error;
  if (isOperational) {
    res.status(statusCode).json({
      message,
    });
    return;
  }
  console.error("big bug!!!", error);
  //罐頭訊息
  res.status(500).json({
    status: "error",
    message: "系統錯誤，請稍後再試",
  });
};

// dev env error
const resErrorDev = (error, res) => {
  const { stack, message, statusCode } = error;
  res.status(statusCode).json({
    status: "error",
    message: {
      message,
      error,
      stack,
    },
  });
};

//error
app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  if (process.env.NODE_ENV === "dev") {
    return resErrorDev(error, res);
  }
  if (error.name === "ValidationError") {
    error.message = errorList[error.name];
    err.isOperational = true;
    return resErrorProd(err, res);
  }
  if(error.name === 'CastError'){
    error.message = errorList[error.name];
    err.isOperational = true;
    return resErrorProd(err, res)
  }
  resErrorPrd(error, res);
});

//未捕捉的catch
process.on("unhandledRejection", (error, promise) => {
  console.log("error", promise, error);
});

module.exports = app;
