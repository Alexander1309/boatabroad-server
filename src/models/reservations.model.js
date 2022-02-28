const { model, Schema } = require('mongoose')

const ReservationsModel = model('reservations', new Schema({
    postId: { type: String, required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    startDate: { type: Date, required: true },
    hours: { type: Number, required: true },
    endDate: { type: Date, required: true },
    extraHours: { type: Number, default: 0 },
    processingPayment: { type: Boolean, default: true },
    paymentMethodId: String,
    customerId: String,
}))

module.exports = ReservationsModel