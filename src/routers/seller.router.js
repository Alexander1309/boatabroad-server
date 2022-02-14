const router = require('express').Router()
const PostsModel = require('../models/posts.model')
const UsersModel = require('../models/users.model')
const { upload, validateUpload, verifyToken, verifyRoles, deleteFile, sendEmail } = require('../lib/functions')
const { msgNewPost } = require('../lib/msg')
const { Post } = require('../lib/http')

const uploadImgPost = upload('img', 500000, /png|jpg|jpeg/, 'posts_picture')

router.get('/getPosts', verifyToken, verifyRoles(['Seller']), async (req, res) => {
    const { _id } = req.dataUser
    const posts = await PostsModel.find({idUser: _id}).exec()
    res.json(posts)
})

router.post('/newPost', verifyToken, verifyRoles(['Seller']), validateUpload(uploadImgPost), async (req, res) => {
    const { 
        title,
        subtitle,
        shortDescription,
        largeDescription,
        price,
        currency,
        boatType,
        boatSize,
        crew,
        city,
        marinaBeach,
        damage,
        numberOfSailors,
        includeFood,
        includeDrinks,
        bathrooms,
        bedrooms,
        kitchen
    } = req.body
    const { filename, path } = req.file
    const { _id } = req.dataUser

    const newPost = new PostsModel({
        idUser: _id,
        title,
        subtitle,
        shortDescription,
        largeDescription,
        price: parseFloat(price),
        currency,
        imgUrl: `${process.env.ApiUrl}/assets/posts_picture/${filename}`,
        pathImg: path,
        boatType,
        boatSize: parseFloat(boatSize),
        crew: parseInt(crew),
        city,
        marinaBeach,
        damage,
        numberOfSailors: parseInt(numberOfSailors),
        includeFood,
        includeDrinks,
        bathrooms: parseInt(bathrooms),
        bedrooms: parseInt(bedrooms),
        kitchen
    })

    const admins = await UsersModel.find({role: 'Admin'}).exec()

    try {
        admins.map(async admin => {
            await sendEmail(admin.email, 'New Post From Boatabroad', msgNewPost(newPost._id))
        })
        await newPost.save()
        res.json({ server: 'postCreated'}).status(200)
    } catch(e) {
        await deleteFile(path)
        res.json({ server: 'postNotCreated'}).status(200)
    }
})

router.put('/updatePost/:idPost', verifyToken, verifyRoles(['Seller']), validateUpload(uploadImgPost), async (req, res) => {
    const { idPost } = req.params
    const { _id } = req.dataUser
    const { filename, path } = req.file
    const { 
        title,
        subtitle,
        shortDescription,
        largeDescription,
        price,
        currency,
        boatType,
        boatSize,
        crew,
        city,
        marinaBeach,
        damage,
        numberOfSailors,
        includeFood,
        includeDrinks,
        bathrooms,
        bedrooms,
        kitchen
    } = req.body

    const post = await PostsModel.findOne({_id: idPost}).exec()
    console.log(post)
    if(post !== null && post.idUser === _id) {
        const deletedFile = await deleteFile(post.pathImg)
        if(deletedFile) {
            const updatePost = await PostsModel.updateOne({ _id: idPost }, {
                title,
                subtitle,
                shortDescription,
                largeDescription,
                price: parseFloat(price),
                currency,
                imgUrl: `${process.env.ApiUrl}/assets/posts_picture/${filename}`,
                pathImg: path,
                boatType,
                boatSize: parseFloat(boatSize),
                crew: parseInt(crew),
                city,
                marinaBeach,
                damage,
                numberOfSailors: parseInt(numberOfSailors),
                includeFood,
                includeDrinks,
                bathrooms: parseInt(bathrooms),
                bedrooms: parseInt(bedrooms),
                kitchen
            }).exec()
        
            if(updatePost.modifiedCount === 1) res.json({server: 'updatedPost'}) 
            else {
                await deleteFile(path)
                res.json({server: 'updatedNotPost'})
            }
        } else {
            await deleteFile(path)
            res.json({server: 'updatedNotPost'})
        }
        
    } else {
        await deleteFile(path)
        res.json({server: 'postNotExist'})
    }
})

router.delete('/deletePost/:idPost', verifyToken, verifyRoles(['Seller']), async (req, res) => {
    const { idPost } = req.params
    const { _id } = req.dataUser

    const post = await PostsModel.findOne({_id: idPost}).exec()

    if(post !== null && post.idUser === _id) {
        const deletedFile = await deleteFile(post.pathImg)
        if(deletedFile) {
            const deletePost = await PostsModel.deleteOne({ _id: idPost }).exec()
        
            if(deletePost.deletedCount === 1) res.json({server: 'deletedPost'}) 
            else res.json({server: 'deletedNotPost'})
        } else res.json({server: 'deletedNotPost'})
    } else res.json({server: 'postNotExist'})
})

module.exports= router