const router = require('express').Router()
const path = require('path')
const _ = require('lodash')
const PostsModel = require('../models/posts.model')
const UsersModel = require('../models/users.model')
const { sendEmail } = require('../lib/functions')
const moment = require('moment')
const { v4: uuid } = require('uuid')
const ReservationsModel = require('../models/reservations.model')
const { 
    verifyToken, 
    verifyRoles, 
    upload, 
    validateUpload, 
    pictureUpload, 
    deleteFileUpload, 
    getDiacriticSensitiveRegex,
    createPaymentMethod,
    getTotalPrice,
    performPayment,
} = require('../lib/functions')
const { stripe } = require('../utils/stripe')
require('dotenv').config()

const uploadProfilePicture = upload('profile_picture', 500000, /png|jpg|jpeg/, 'profile_picture', 1)

router.get('/assets/:folder/:filename', (req, res) => {
    const { folder, filename } = req.params
    const pathFile = path.join(__dirname, '../', 'assets', `${folder}`, `${filename}`)
    res.sendFile(pathFile, (err) => {
        if(err) res.send('File not Exist')
        else res.status(200)
    })
})

router.get('/posts', async (req, res) => {
    const {
        search = '',
        marinaBeach = '',
        boatType = '',
        minimumPrice = 0,
        startDate,
        endDate,
        numberOfSailors = 0,
    } = req.query
    const escapedSearch = new RegExp(getDiacriticSensitiveRegex(_.escapeRegExp(search)), 'i')
    const marinaBeachSearch = new RegExp(getDiacriticSensitiveRegex(_.escapeRegExp(marinaBeach)), 'i')
    const boatTypeSearch = new RegExp(getDiacriticSensitiveRegex(_.escapeRegExp(boatType)), 'i')

    const options = {
        status: 'approved',
        numberOfSailors: { $gte: numberOfSailors },
        marinaBeach: { $regex: marinaBeachSearch },
        boatType: { $regex: boatTypeSearch },
        price: { $gte: minimumPrice },
        $or: [
            {
                boatType: { $regex: escapedSearch }
            },
            {
                city: { $regex: escapedSearch }
            },
            {
                marinaBeach: { $regex: escapedSearch }
            }
        ],
        // TODO add startDate and endDate filters
    }

    const posts = await PostsModel.find(options).exec()
    res.json(posts)
})

router.get('/posts/:id', async (req, res) => {
    const { id } = req.params
    const post = await PostsModel.findById(id)
    const seller = await UsersModel.findOne({ _id: post.idUser })

    if (!seller) return res.status(404).json({ message: 'Seller not found' })

    res.json({ ...post._doc, sellerName: seller.name })
})

router.put('/profilePictures', verifyToken, verifyRoles(['User', 'Seller', 'Admin']), validateUpload(uploadProfilePicture), async (req, res) => {
    const files = req.files
    const { _id } = req.dataUser

    const user = await UsersModel.findOne({ _id }).exec()
    const { secure_url, public_id } = await pictureUpload(files[0].path, 500, 500, 'profile_picture')

    if(user !== null && user.pathPicture !== 'icon') {
        const deletedFile = await deleteFileUpload([user.pathPicture])
        if(deletedFile) {
            const updateProfilePicture = await UsersModel.updateOne({ _id }, { profilePicture: secure_url, pathPicture: public_id }).exec()
            if(updateProfilePicture.modifiedCount === 1) res.json({sevrer: 'updatedProfilePicture', secure_url})
            else {
                await deleteFileUpload([public_id])
                res.json({server: 'updatedNotProfilePicture'})
            }
        } else {
            await deleteFileUpload([public_id])
            res.json({server: 'updatedNotProfilePicture'})
        }
    } else {
        const updateProfilePicture = await UsersModel.updateOne({ _id }, { profilePicture: secure_url, pathPicture: public_id }).exec()
        if(updateProfilePicture.modifiedCount === 1) res.json({sevrer: 'updatedProfilePicture', secure_url})
        else {
            await deleteFileUpload([public_id])
            res.json({server: 'updatedNotProfilePicture'})
        }
    }
})

router.delete('/profilePictures', verifyToken, verifyRoles(['User', 'Seller', 'Admin']), async (req, res) => {
    const { _id } = req.dataUser

    const pathImg = await (await UsersModel.findOne({ _id }).exec()).pathPicture

    if(pathImg !== 'icon') {
        const deletedFile = await deleteFileUpload([pathImg])
        if(deletedFile) {
            const deleteProfilePicture = await UsersModel.updateOne({ _id }, { profilePicture: 'icon', pathPicture: 'icon' }).exec()
            if(deleteProfilePicture.modifiedCount === 1) res.json({sevrer: 'deletedProfilePicture'})
            else {
                res.json({server: 'deletedNotProfilePicture'})
            }
        } else {
            res.json({server: 'deletedNotProfilePicture'})
        }
    } else {
        res.json({server: 'deletedNotProfilePicture'})
    }
})

router.get('/emailVerifications/:emailVerificationCode', async (req, res) => {
    const { emailVerificationCode } = req.params

    try {
        const updateResult = await UsersModel.updateOne({ emailVerificationCode }, { verifyEmail: true })
        const confirmationStatus = updateResult.modifiedCount === 1 ? 'ok' : 'alreadyVerified'

        res.redirect(`${process.env.WEB_URL}/login?emailConfirmationStatus=${confirmationStatus}`)
    } catch(error) {
       res.status(500).json({ error: { message: 'There was an error verifying the email address.' } })
    }
})

router.post('/posts/:postId/reservations', verifyToken, verifyRoles(['User']), async (req, res) => {
    const { postId } = req.params
    const { card, startDate, hours } = req.body
    const user = req.dataUser
    const post = await PostsModel.findOne({_id: postId}).exec()
    let paymentMethod
    let customer

    // Creates the payment method based on the credit or debit card
    try {
        paymentMethod = await createPaymentMethod(card)
    } catch(error) {
        console.error(error)
        return res.status(400).json({ error: { message: error.message } })
    }

    try {
        customer = await stripe.customers.create({
            payment_method: paymentMethod.id
        })
    } catch(error) {
        console.error(error)
        return res.status(500).json({ error: { message: 'There was an error setting up the payment' } })
    }


    const totalPrice = getTotalPrice(post, hours)
    const reservation = new ReservationsModel({
        postId: post._id,
        userId: user._id,
        amount: totalPrice,
        currency: post.currency,
        startDate,
        hours,
        endDate: moment(startDate).add(hours, 'hours').toISOString(),
        paymentMethodId: paymentMethod.id,
        customerId: customer.id,
    })

    await reservation.save()

    // Creates a payment without confirmation
    try {
        await performPayment(user, post, reservation, paymentMethod, customer, totalPrice)

        res.json({ message: 'Payment created' })
    } catch(error) {
        console.error(error)
        res.status(500).json({ error: { message: 'There was an error creating the payment'} })
    }
})

router.post('/paymentEvents', async (req, res) => {
    const event = req.body
    let paymentIntent
    
    switch (event.type) {
        case 'payment_intent.succeeded': {
            paymentIntent = event.data.object
            const idUser = paymentIntent.metadata.userId
            const idPost = paymentIntent.metadata. postId
            console.log('id user', idUser)
            console.log('id post', idPost)
            const user_email = (await UsersModel.findOne({_id: idUser}).exec()).email
            const user_id = (await PostsModel.findOne({_id: idPost}).exec()).idUser
            
            console.log(user_email, user_id)
            
            if(user_email !== null && user_id !== null) {
                const emailCreate = (await UsersModel.findOne({_id: user_id}).exec()).email
                if(emailCreate !== null) {
                    await sendEmail(user_email, 'Pago realizado con exito', '<h1>Holaa</h1>')
                    await sendEmail(emailCreate, 'Pago realizado con exito', '<h1>Holaa</h1>')
                }
            }
            break
        }
        
        case 'payment_intent.canceled': {
            paymentIntent = event.data.object
            
            break
        }
        
        case 'payment_intent.payment_failed': {
            paymentIntent = event.data.object

            break
        }

        default:
            console.log(`Unhandled event type ${event.type}`)
    }
  
    res.send()
})

module.exports = router
