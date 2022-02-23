const router = require('express').Router()
const PostsModel = require('../models/posts.model')
const UsersModel = require('../models/users.model')
const ReservationsModel = require('../models/reservations.model')
const { pictureUpload, deleteFileUpload, deleteMultiFile, deleteOneFile, upload, validateUpload, verifyToken, verifyRoles, sendEmail } = require('../lib/functions')
const { msgNewPost } = require('../lib/msg')

const uploadImgPost = upload('img', 500000, /png|jpg|jpeg/, 'posts_picture', 7)

router.get('/getPosts', verifyToken, verifyRoles(['Seller']), async (req, res) => {
    const { _id } = req.dataUser
    const posts = await PostsModel.find({idUser: _id}).exec()
    res.json(posts)
})

router.post('/newPost', verifyToken, verifyRoles(['Seller']), validateUpload(uploadImgPost), async (req, res) => {
    let count = 0
    const { 
        title,
        subtitle,
        shortDescription,
        largeDescription,
        price,
        currency,
        boatType,
        boatSize,
        minHours,
        crew,
        city,
        marinaBeach,
        damage,
        numberOfSailors,
        includeFood,
        includeDrinks,
        bathrooms,
        bedrooms,
        kitchen,
        hasAirConditioning,
        hasBluetoothSound,
        hasLounge,
        hasTV,
        hasTowels,
        hasDishes,
        beers,
        sodas,
        hasIce,
        tableWaters,
    } = req.body
    const { _id } = req.dataUser
    const files = req.files
    const imgUrls = []
    const imgPaths = []

    for(const file of files){
        const { secure_url, public_id } = await pictureUpload(file.path, 500, 500, 'posts_picture')
        imgUrls.push(secure_url)
        imgPaths.push(public_id)
    }

    const newPost = new PostsModel({
        idUser: _id,
        title,
        subtitle,
        shortDescription,
        largeDescription,
        price: parseFloat(price),
        currency,
        imgUrls,
        imgPaths,
        boatType,
        boatSize: parseFloat(boatSize),
        minHours: parseInt(minHours),
        crew: parseInt(crew),
        city,
        marinaBeach,
        damage,
        numberOfSailors: parseInt(numberOfSailors),
        includeFood,
        includeDrinks,
        bathrooms: parseInt(bathrooms),
        bedrooms: parseInt(bedrooms),
        kitchen,
        hasAirConditioning,
        hasBluetoothSound,
        hasLounge,
        hasTV,
        hasTowels,
        hasDishes,
        beers: parseInt(beers),
        sodas,
        hasIce,
        tableWaters: parseInt(tableWaters)
    })

    try {
        const admins = await UsersModel.find({role: 'Admin'}).exec()
        admins.map(async admin => {
            await sendEmail(admin.email, 'New Post From Boatabroad', msgNewPost(newPost._id))
        })
        await newPost.save()
        res.json({ server: 'postCreated'}).status(200)
    } catch(e) {
        await deleteFileUpload(imgPaths)
        await deleteMultiFile(files)
        res.json({ server: 'postNotCreated'}).status(200)
    }
})

router.put('/updatePost/:idPost', verifyToken, verifyRoles(['Seller']), validateUpload(uploadImgPost), async (req, res) => {
    const { idPost } = req.params
    const { _id } = req.dataUser
    const files = req.files
    const imgUrls = []
    const imgPaths = []
    for(const file of files){
        const { secure_url, public_id } = await pictureUpload(file.path, 500, 500, 'posts_picture')
        imgUrls.push(secure_url)
        imgPaths.push(public_id)
    }

    const { 
        title,
        subtitle,
        shortDescription,
        largeDescription,
        price,
        currency,
        boatType,
        boatSize,
        minHours,
        crew,
        city,
        marinaBeach,
        damage,
        numberOfSailors,
        includeFood,
        includeDrinks,
        bathrooms,
        bedrooms,
        kitchen,
        hasAirConditioning,
        hasBluetoothSound,
        hasLounge,
        hasTV,
        hasTowels,
        hasDishes,
        beers,
        sodas,
        hasIce,
        tableWaters,
    } = req.body

    const post = await PostsModel.findOne({_id: idPost}).exec()
    if(post !== null && post.idUser === _id) {
        const deletedFile = await deleteFileUpload(post.imgPaths)
        if(deletedFile) {
            const updatePost = await PostsModel.updateOne({ _id: idPost }, {
                title,
                subtitle,
                shortDescription,
                largeDescription,
                price: parseFloat(price),
                currency,
                imgUrls,
                imgPaths,
                boatType,
                boatSize: parseFloat(boatSize),
                minHours: parseInt(minHours),
                crew: parseInt(crew),
                city,
                marinaBeach,
                damage,
                numberOfSailors: parseInt(numberOfSailors),
                includeFood,
                includeDrinks,
                bathrooms: parseInt(bathrooms),
                bedrooms: parseInt(bedrooms),
                kitchen,
                hasAirConditioning,
                hasBluetoothSound,
                hasLounge,
                hasTV,
                hasTowels,
                hasDishes,
                beers: parseInt(beers),
                sodas,
                hasIce,
                tableWaters: parseInt(tableWaters)
            }).exec()

            if(updatePost.modifiedCount === 1) res.json({server: 'updatedPost'}) 
            else {
                await deleteFileUpload(imgPaths)
                await deleteMultiFile(imgPaths)
                res.json({server: 'updatedNotPost'})
            }
        } else {
            await deleteFileUpload(imgPaths)
            await deleteMultiFile(imgPaths)
            res.json({server: 'updatedNotPost'})
        }
        
    } else {
        await deleteFileUpload(imgPaths)
        await deleteMultiFile(imgPaths)
        res.json({server: 'postNotExist'})
    }
})

router.delete('/deletePost/:idPost', verifyToken, verifyRoles(['Seller']), async (req, res) => {
    const { idPost } = req.params
    const { _id } = req.dataUser

    const post = await PostsModel.findOne({_id: idPost}).exec()

    if(post !== null && post.idUser === _id) {
        const boatIsReserved = await ReservationsModel.findOne({idPost}).exec()
        if(boatIsReserved === null) {
            const deletedFile = await deleteFileUpload(post.imgPaths)
            if(deletedFile) {
                const deletePost = await PostsModel.deleteOne({ _id: idPost }).exec()
            
                if(deletePost.deletedCount === 1) res.json({server: 'deletedPost'}) 
                else res.json({server: 'deletedNotPost'})
            } else res.json({server: 'deletedNotPost'})
        } else res.json({server: 'postIsReservedItCannotBeDeleted'})
    } else res.json({server: 'postNotExist'})
})

module.exports= router