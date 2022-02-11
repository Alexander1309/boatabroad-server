const { model, Schema } = require('mongoose')

const VerifyPostsModel = new model('verifyPosts', new Schema({
    idPost: { type: String, required: true },
    idUser: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    shortDescription: { type: String, require: true },
    largeDescription: { type: String, require: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    imgUrl: { type: String, required: true },
    pathImg: { type: String, required: true },
    boatType: { type: String, required: true },
    boatSize: { type: Number, required: true },
    crew: { type: Number, required: true },
    city: { type: String, required: true },
    marinaBeach: { type: String, required: true },
    damage: {type: Number, required: true },
    numberOfSailors: { type: Number, required: true },
    includeFood: { type: Boolean, required: true },
    includeDrinks: { type: Boolean, required: true },
    bathrooms: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    kitchen: { type: Boolean, required: true },
    verifiedPost: { type: Boolean, default: false }
}))

module.exports = VerifyPostsModel