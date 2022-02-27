const router = require('express').Router()
const { verifyToken, verifyRoles, sendEmail } = require('../lib/functions')
const PostsModel = require('../models/posts.model')
const UsersModel = require('../models/users.model')

router.get('/users', verifyToken, verifyRoles(['Admin']), async (req, res) => {
    const posts = await UsersModel.find().exec()
    res.json(posts)
})

router.get('/posts', verifyToken, verifyRoles(['Admin']), async (req, res) => {
    const { status } = req.query

    const posts = await PostsModel.find({ status }).exec()
    res.json(posts)
})

router.post('/posts/:idPost/approvals', verifyToken, verifyRoles(['Admin']), async (req, res) => {
    const { idPost } = req.params
    const post = await PostsModel.findOne({_id: idPost}).exec()

    if(post !== null) {
        const updatePost = await PostsModel.updateOne({ _id: post.idPost }, { status: 'approved'}).exec()
        
        if(updatePost.modifiedCount === 1) {
            const user = await UsersModel.findOne({_id: post.idUser}).exec()
            await sendEmail(user.email, 'Publicacion verificada', 'La publicasion a sido aprobada', `<h1>Holaaaa</h1>`)
            res.json({server: 'updatedPost'})
        } else res.json({server: 'postNotUpdated'})
    } else res.json({server: 'postNotExist'})
})

router.put('/posts/:idPost/rejections', verifyToken, verifyRoles(['Admin']), async (req, res) => {
    const { idPost } = req.params
    const { isRejected } = req.body
    const post = await PostsModel.findOne({_id: idPost}).exec()
    if(post !== null) {
        const updatePost = await PostsModel.updateOne({ _id: idPost }, { status: 'rejected'}).exec()
        
        if(updatePost.modifiedCount === 1) {
            const user = await UsersModel.findOne({_id: post.idUser}).exec()
            await sendEmail(user.email, 'Publicacion Bloqueada', 'La publicasion a sido bloqueada por incumplir reglas', `<h1>Holaaaa</h1>`)
            res.json({server: 'updatedPost'})
        } else res.json({server: 'postNotUpdated'})
    } else res.json({server: 'postNotExist'})
})

module.exports = router