const { model, Schema } = require('mongoose')

const PostsSchema = new Schema({
    idUser: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    shortDescription: { type: String, require: true },
    largeDescription: { type: String, require: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    images: [{ path: String, url: String }],
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
    hasSodas: { type: Boolean, required: true },
    hasIce: { type: Boolean, required: true },
    mineralWaters: { type: Number, required: true },
    status: { type: String, default: 'pending' }, // pending, approved, rejected
    rejectionReason: String,
})

const PostsModel = model('posts', PostsSchema)

module.exports = PostsModel