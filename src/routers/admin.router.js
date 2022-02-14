const router = require('express').Router()
const { verifyToken, verifyRoles, sendEmail } = require('../lib/functions')
const { Delete } = require('../lib/http')
const VerifyPosts = require('../models/verifyPosts.model')
const PostsModel = require('../models/posts.model')
const UsersModel = require('../models/users.model')

router.get('/getUsers', verifyToken, verifyRoles(['Admin']), async (req, res) => {
    const posts = await UsersModel.find().exec()
    res.json(posts)
})

router.get('/getVerifyPosts', verifyToken, verifyRoles(['Admin']), async (req, res) => {
    const posts = await VerifyPosts.find().exec()
    res.json(posts)
})

router.post('/postToBeVerified', async (req, res) => {
    const {
        _id,
        idUser
    } = req.body

    console.log(req.body)
    
    const verifyPost = new VerifyPosts({
        idPost: _id,
        idUser
    })
    console.log(verifyPost)

    try {
        await verifyPost.save()
        res.json({ server: 'postInVerification'}).status(200)
    } catch(e) {
        res.json({ server: 'postNotInVerification'}).status(200)
    }  
})

router.put('/verifyPost/:idPost', verifyToken, verifyRoles(['Admin']), async (req, res) => {
    const { idPost } = req.params
    const post = await VerifyPosts.findOne({_id: idPost}).exec()

    if(post !== null) {
        const updatePost = await PostsModel.updateOne({ _id: post.idPost }, {verifiedPost: true}).exec()
        
        if(updatePost.modifiedCount === 1) {
            const deleteVerifyPost = await (await Delete(`http://localhost:3001/admin/deletePost/${idPost}`)).server
            if(deleteVerifyPost === 'deletedPost') {
                const user = await UsersModel.findOne({_id: post.idUser}).exec()
                await sendEmail(user.email, 'Publicacion verificada', 'La publicasion a sido aprobada', `<h1>Holaaaa</h1>`)
                res.json({server: 'updatedPost'})
            } 
            else res.json({server: 'updatedNotPost'})
        } else res.json({server: 'updatedNotPost'})
    } else res.json({server: 'postNotExist'})
})

router.put('/lockedPost/:idPost', verifyToken, verifyRoles(['Admin']), async (req, res) => {
    const { idPost } = req.params
    const { isBlocked } = req.body
    const post = await PostsModel.findOne({_id: idPost}).exec()
    if(post !== null) {
        const updatePost = await PostsModel.updateOne({ _id: idPost }, { verifiedPost: !isBlocked, lockedPost: isBlocked }).exec()
        
        if(updatePost.modifiedCount === 1) {
            const user = await UsersModel.findOne({_id: post.idUser}).exec()
            await sendEmail(user.email, 'Publicacion Bloqueada', 'La publicasion a sido bloqueada por incumplir reglas', `<h1>Holaaaa</h1>`)
            res.json({server: 'updatedPost'})
        } else res.json({server: 'updatedNotPost'})
    } else res.json({server: 'postNotExist'})
})

router.delete('/deletePost/:idPost', async (req, res) => {
    const { idPost } = req.params
    const post = await VerifyPosts.findOne({_id: idPost}).exec()

    if(post !== null) {
        const deleteVerifyPost = await VerifyPosts.deleteOne({ _id: idPost }).exec()
        if(deleteVerifyPost.deletedCount === 1) res.json({server: 'deletedPost'}) 
        else res.json({server: 'deletedNotPost'})
    } else res.json({server: 'postNotExist'})
})

module.exports = router