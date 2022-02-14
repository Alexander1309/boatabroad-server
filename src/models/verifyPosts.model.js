const { model, Schema } = require('mongoose')

const VerifyPostsModel = new model('verifyPosts', new Schema({
    idPost: { type: String, required: true },
    idUser: { type: String, required: true }
}))

module.exports = VerifyPostsModel