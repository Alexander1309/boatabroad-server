const router = require('express').Router()
const { verifyToken } = require('../lib/functions')
const MessageModel = require('../models/messages.model')

router.post('/messages', verifyToken, async (req, res) => {
    const io = req.io
    const idFrom = req.dataUser._id.toString()
    const { idTo, message } = req.body

    const newMessage = new MessageModel({
        idFrom,
        idTo,
        message
    })


    try {
        await newMessage.save()
        io.emit('newMessage', newMessage.message)
        res.json({server: 'sendMessage'})
    } catch(e) {
        res.json({server: 'sendNotMessage'})
    }

})

router.get('/messages', verifyToken, async (req, res) => {
    const { _id } = req.dataUser
    const messages = await MessageModel.find({$or: [{ idFrom: _id }, { idTo: _id }]}).exec()
    if(messages !== null) res.json(messages)
    else res.json({server: 'notMessages'})
})

module.exports = router