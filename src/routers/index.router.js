const router = require('express').Router()
const Stripe = require('stripe')
const path = require('path')
const _ = require('lodash')
const PostsModel = require('../models/posts.model')
const UsersModel = require('../models/users.model')
const { verifyToken, verifyRoles, upload, validateUpload, pictureUpload, deleteFileUpload, deleteMultiFile } = require('../lib/functions')
require('dotenv').config()

const uploadProfilePicture = upload('profile_picture', 500000, /png|jpg|jpeg/, 'profile_picture', 1)

const stripe = new Stripe(process.env.StripeSecretKey)

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
        search,
        startDate,
        endDate,
        numberOfSailors = 0,
    } = req.query
    const escapedSearch = new RegExp(_.escapeRegExp(search), 'i')

    const posts = await PostsModel.find({
        verifiedPost: true,
        numberOfSailors: { $gte: numberOfSailors },
        $or: [
            {
                title: { $regex: escapedSearch }
            },
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
    }).exec()
    res.json(posts)
})

router.get('/posts/:id', verifyToken, verifyRoles(['User', 'Seller', 'Admin']), async (req, res) => {
    const { id } = req.params
    const post = await PostsModel.findOne({ verifiedPost: true, _id: id })
    const seller = await UsersModel.findOne({ _id: post.idUser })

    if (!seller) return res.status(404).json({ message: 'Seller not found' })

    res.json({ ...post._doc, sellerName: seller.name })
})

router.put('/uploadProfilePicture', verifyToken, verifyRoles(['User', 'Seller', 'Admin']), validateUpload(uploadProfilePicture), async (req, res) => {
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
                await deleteMultiFile(files)
                res.json({server: 'updatedNotProfilePicture'})
            }
        } else {
            await deleteFileUpload([public_id])
            await deleteMultiFile(files)
            res.json({server: 'updatedNotProfilePicture'})
        }
    } else {
        const updateProfilePicture = await UsersModel.updateOne({ _id }, { profilePicture: secure_url, pathPicture: public_id }).exec()
        if(updateProfilePicture.modifiedCount === 1) res.json({sevrer: 'updatedProfilePicture', secure_url})
        else {
            await deleteFileUpload([public_id])
            await deleteMultiFile(files)
            res.json({server: 'updatedNotProfilePicture'})
        }
    }
})

router.delete('/deleteProfilePicture', verifyToken, verifyRoles(['User', 'Seller', 'Admin']), async (req, res) => {
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

router.post('/checkout', verifyToken, verifyRoles(['User', 'Seller', 'Admin']), async (req, res) => {
    const { id, amount } = req.body
    const payment = await stripe.paymentIntents.create({
        amount,
        currency: "MXN",
        description: "prueba",
        payment_method: id,
        confirm: true
    })

    console.log(payment)
})

module.exports = router