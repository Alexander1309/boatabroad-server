const { model, Schema } = require('mongoose')

const MessagesModel = new model('messages', new Schema({
    idFrom: { type: String, required: true },
    idTo: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, defualt: Date.now }
}))

module.exports = MessagesModel