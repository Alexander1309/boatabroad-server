const router = require('express').Router()
const Stripe = require('stripe')
const path = require('path')
const PostsModel = require('../models/posts.model')
const UsersModel = require('../models/users.model')
const { verifyToken, verifyRoles, upload, validateUpload, deleteFile } = require('../lib/functions')
require('dotenv').config()

const uploadProfilePicture = upload('profile_picture', 500000, /png|jpg|jpeg/, 'profile_picture', 1)

const stripe = new Stripe(process.env.StripeSecretKey)

router.get('/assets/:folder/:filename', (req, res) => {
    const { folder, filename } = req.params
    const pathFile = path.join(__dirname, '../', 'assets', `${folder}`, `${filename}`)
    res.sendFile(pathFile, (err) => {
        if(err) res.send('File not Exist').status(200)
        else res.status(200)
    })
})

router.get('/getPosts', async (req, res) => {
    const posts = await PostsModel.find({ verifiedPost: true }).exec()
    res.json(posts)
})

router.get('/getPosts/:id', verifyToken, verifyRoles(['User', 'Seller', 'Admin']), async (req, res) => {
    const { id } = req.params
    const post = await PostsModel.findOne({ verifiedPost: true, _id: id })
    const seller = await UsersModel.findOne({ _id: post.idUser })

    if (!seller) return res.status(404).json({ message: 'Seller not found' })

    res.json({ ...post._doc, sellerName: seller.name })
})

router.get('/getPosts/:bType/:mBeach/:cityBoat/:numOfSailors', verifyToken, verifyRoles(['User', 'Seller', 'Admin']), async (req, res) => {
    const { bType, mBeach, cityBoat, numOfSailors } = req.params
    const posts = await PostsModel.find({ verifiedPost: true, $or: [{boatType: bType}, {marinaBeach: mBeach}, {city: cityBoat}, {numberOfSailors: JSON.parse(numOfSailors)}]}).exec()
    if(posts.length > 0) res.json(posts)
    else res.json({server: 'NoPublication'})
})

router.put('/uploadProfilePicture', verifyToken, verifyRoles(['User', 'Seller', 'Admin']), validateUpload(uploadProfilePicture), async (req, res) => {
    const files = req.files
    const { _id } = req.dataUser

    const user = await UsersModel.findOne({ _id }).exec()
    const urlImg = `${process.env.ApiUrl}assets/profile_picture/${files[0].filename}`

    if(user !== null && user.pathPicture !== 'icon') {
        const deletedFile = await deleteFile([user.pathPicture])
        if(deletedFile) {
            const updateProfilePicture = await UsersModel.updateOne({ _id }, { profilePicture: urlImg, pathPicture: files[0].path }).exec()
            if(updateProfilePicture.modifiedCount === 1) res.json({sevrer: 'updatedProfilePicture', urlImg})
            else {
                await deleteFile(files)
                res.json({server: 'updatedNotProfilePicture'})
            }
        } else {
            await deleteFile(files)
            res.json({server: 'updatedNotProfilePicture'})
        }
    } else {
        const updateProfilePicture = await UsersModel.updateOne({ _id }, { profilePicture: urlImg, pathPicture: files[0].path }).exec()
        if(updateProfilePicture.modifiedCount === 1) res.json({sevrer: 'updatedProfilePicture', urlImg})
        else {
            await deleteFile(files)
            res.json({server: 'updatedNotProfilePicture'})
        }
    }
})

router.delete('/deleteProfilePicture', verifyToken, verifyRoles(['User', 'Seller', 'Admin']), async (req, res) => {
    const { _id } = req.dataUser

    const pathImg = await (await UsersModel.findOne({ _id }).exec()).pathPicture

    if(pathImg !== 'icon') {
        const deletedFile = await deleteFile([pathImg])
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