const { model, Schema } = require('mongoose')

const UsersModel = model('users', new Schema({
    parentUserId: String, // When a user is created by another user, this field is filled with the id of the parent user
    name: { type: String, required: true },
    surname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    profilePicture: { type: String, default: 'icon'},
    pathPicture: { type: String, default: 'icon'},
    securityCode: { type: String, unique: true },
    emailVerificationCode: { type: String },
    verifyEmail: { type: Boolean, default: false },
    timer: { type: Number, default: 60 * 1000 }, // Timer to verify the security code
}))

module.exports = UsersModel