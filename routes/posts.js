const { json } = require('express');
const express = require('express');
const router = express.Router();
const Posts = require("../models/posts");

router.get('/', async function(req, res, next) {
    const postList = await Posts.find();
    res.status(200).json({message:"success", posts:postList})
});

router.post('/', async function(req, res, next) {
    try {
        const { content, image, name, likes } = req.body
        if(name === undefined || content === undefined){
            res.status(400).send("參數有缺");
            return
        }
        const newPost =  await Posts.create({
            content, image, name, likes,
        })
        res.status(200).json({message:"success", posts: newPost})
    } catch (error) {
        res.status(400).send("新增失敗");
    }
});

router.patch('/:id', async function(req, res, next) {
    try {
        const { id } = req.params;
        const { name, content } = req.body;
        if(name === undefined || content === undefined){
            res.status(400).send("參數有缺");
            return     
        }
        const target = await Posts.findByIdAndUpdate(id, {name, content}, { new: true });
        if(target){
            res.status(200).json({message:"success", post: target})
        }else{
            res.status(400).send("無此id");   
        }
    } catch (error) {
        res.status(400).send("修改失敗");   
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
        const { id } = req.params;
        await Posts.findByIdAndDelete(id)
        res.status(200).json({message:"success"})
    } catch (error) {
        res.status(400).send("無此id");     
    }
});

router.delete('/', async function(req, res, next) {
    try {
        await Posts.deleteMany({});
        res.status(200).json({message:"success", posts:[]})
    } catch (error) {
        res.status(400).send("刪除失敗");     
    }
});


module.exports = router;