const { model, Schema } = require('mongoose')

const ReservationsModel = new model('reservations', new Schema({
    idPots: { type: String, required: true },
    idUser: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    hours: { type: Number, required: true },
    paidHours: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reservationNumber: { type: String, required: true },
    payment: { type: Boolean, required: true, default: 'false' }
}))

module.exports = ReservationsModel