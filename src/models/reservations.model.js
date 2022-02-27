const { model, Schema } = require('mongoose')

const ReservationsModel = model('reservations', new Schema({
    postId: { type: String, required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    startDate: { type: Date, required: true },
    hours: { type: Number, default: 0 },
    endDate: { type: Date, required: true },
    extraHours: { type: Number, required: true },
    processingPayment: { type: Boolean, default: true }
}))

module.exports = ReservationsModel