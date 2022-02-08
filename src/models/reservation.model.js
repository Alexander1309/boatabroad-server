const { model, Schema } = require('mongoose')

const ReservationsModel = new model('reservations', new Schema({
    idPost: { type: String, required: true },
    idUser: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reservedDays: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    currency: { type: String, required: true },
    processingPayment: { type: Boolean, default: false }
}))

module.exports = ReservationsModel