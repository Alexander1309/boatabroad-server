const { model, Schema } = require('mongoose')

const PostsModel = new model('posts', new Schema({
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
    minHours: { type: Number, required: true },
    damage: {type: Boolean, required: true },
    numberOfSailors: { type: Number, required: true },
    includeFood: { type: Boolean, required: true },
    includeDrinks: { type: Boolean, required: true },
    bathrooms: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    kitchen: { type: Boolean, required: true },
    verifiedPost: { type: Boolean, default: false },
    lockedPost: { type: Boolean, default: false },
    // reservedDays: { type: [Number]} // [[1, 3, 01]]
    // reservedHours: {}
}))

module.exports = PostsModel