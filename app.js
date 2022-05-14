var express = require("express");
var path = require("path");
const mongoose = require("mongoose");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const dotenv = require("dotenv");
const errorList = require('./service/erroList')
dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("connect success");
  })
  .catch((error) => {
    console.error(error.reason);
  });

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var postsRouter = require("./routes/posts");
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
app.use("/", usersRouter);
app.use("/", postsRouter);

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
  const { stack, message } = error;
  res.status(500).json({
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
  if (process.env.NODE_ENV === 'dev'){
    return resErrorDev(error, res);
  }
  if(error.name === 'ValidationError'){
    error.message = errorList[error.name];
    err.isOperational = true;
    return resErrorProd(err, res)
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
