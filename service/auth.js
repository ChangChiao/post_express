const jwt = require("jsonwebtoken");
const express = require("express")
const appError = require("./appError");
const handleErrorAsync = require("./handleErrorAsync");
const User = require("../models/user");

const isAuth = handleErrorAsync((req, res, next) => {
    let token;
    const authorization = req.headers.authorization
    if(authorization && authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return next(appError(401, "您尚未登入", next))
    }

    //check jwt is valid
    const decodedToken = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
            error ? reject(error) : resolve(payload);
        })
    })
    const currentUser = await User.findById(decodedToken.id);
    req.user = currentUser;
    next();
})

// gen token

const generateSendJWT = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_DAY
    })
    user.password = undefined
    res.statusCode(statusCode).json({
        status: "success",
        user: {
            token,
            userName: user.userName
        }
    })
}


module.exports = {
    isAuth,
    generateSendJWT
}