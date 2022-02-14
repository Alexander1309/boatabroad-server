const { model, Schema } = require('mongoose')

const UsersModel = new model('users', new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    profilePicture: { type: String, default: 'icon'},
    pathPicture: { type: String, default: 'icon'},
    securityCode: { type: String, unique: true },
    verifyEmail: { type: Boolean, default: false },
    timer: { type: Number, default: 60 * 1000 }, // Timer para verificar el codigo de seguridad
}))

module.exports = UsersModel