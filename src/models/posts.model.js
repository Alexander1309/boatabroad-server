const { model, Schema } = require('mongoose')

const PostsModel = new model('posts', new Schema({
    idUser: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    shortDescription: { type: String, require: true },
    largeDescription: { type: String, require: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    imgUrls: { type: [String], required: true },
    imgPaths: { type: [String], required: true },
    boatType: { type: String, required: true },
    boatSize: { type: Number, required: true },
    minHours: { type: Number, required: true },
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
    hasAirConditioning: { type: Boolean, required: true },
    hasBluetoothSound: { type: Boolean, required: true },
    hasLounge: { type: Boolean, required: true },
    hasTV: { type: Boolean, required: true },
    hasTowels: { type: Boolean, required: true },
    hasDishes: { type: Boolean, required: true },
    beers: { type: Number, required: true },
    sodas: { type: Boolean, required: true },
    hasIce: { type: Boolean, required: true },
    tableWaters: { type: Number, required: true },
    statusPost: {
        approved: { type: Boolean, default: false },
        locked: { type: Boolean, default: false },
        rejected: {type: Boolean, default: false},
        published: {type: Boolean, default: false},
    }
}))

module.exports = PostsModel