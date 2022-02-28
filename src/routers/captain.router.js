const router = require('express').Router()
const moment = require('moment')
const { verifyToken, verifyRoles } = require('../lib/functions')
const ReservationsModel = require('../models/reservations.model')

router.get('/reservations', verifyToken, verifyRoles(['Captain']), async (req, res) => {
    const user = req.dataUser
    const minimumEndDate = moment().subtract(1, 'day').toDate()
    const maximumEndDate = new Date()

    const reservations = await ReservationsModel.find({
        userId: user.parentUserId,
        endDate: {
            $gte: minimumEndDate,
            $lte: maximumEndDate
        }
    })

    res.json(reservations)
})

module.exports = router