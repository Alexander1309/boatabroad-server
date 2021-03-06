const router = require('express').Router()
const { verifyToken, verifyRoles, sendEmail } = require('../lib/functions')
const { postRejected, postApproved } = require('../lib/msg')
const PostsModel = require('../models/posts.model')
const UsersModel = require('../models/users.model')

router.get('/users', verifyToken, verifyRoles(['Admin']), async (req, res) => {
    const posts = await UsersModel.find().exec()
    res.json(posts)
})

router.get('/posts', verifyToken, verifyRoles(['Admin']), async (req, res) => {
    const { status } = req.query

    const posts = await PostsModel.find({ status })
    res.json(posts)
})

router.post('/posts/:postId/approvals', verifyToken, verifyRoles(['Admin']), async (req, res) => {
    const { postId } = req.params
    const post = await PostsModel.findById(postId)

    if (!post) {
        return res.status(404).json({ error: { message: 'The post was not found' } })
    }

    if (post.status !== 'pending') {
        return res.status(409).json({ error: { message: 'This post is no longer under review' } })
    }

    const updatedPost = await PostsModel.updateOne({ _id: postId }, { status: 'approved', rejectionReason: null })

    if (updatedPost.modifiedCount === 1) {
        const user = await UsersModel.findOne({ _id: post.idUser })
        await sendEmail(user.email, 'Post approved', postApproved(post))
        res.json({ server: 'postUpdated' })
    } else res.status(500).json({ server: 'postNotUpdated' })
})

router.post('/posts/:postId/rejections', verifyToken, verifyRoles(['Admin']), async (req, res) => {
    const { postId } = req.params
    const { reason } = req.body
    const post = await PostsModel.findById(postId)

    if (!post) {
        return res.status(404).json({ error: { message: 'The post was not found' } })
    }

    if (post.status !== 'pending') {
        return res.status(409).json({ error: { message: 'This post is no longer under review' } })
    }

    const updatedPost = await PostsModel.updateOne({ _id: postId }, { status: 'rejected', rejectionReason: reason })

    if(updatedPost.modifiedCount === 1) {
        const user = await UsersModel.findOne({_id: post.idUser}).exec()
        await sendEmail(user.email, 'Post rejected', postRejected(post, reason))
        res.json({server: 'updatedPost'})
    } else res.json({server: 'postNotUpdated'})
})

module.exports = router