const router = require('express').Router()
const { v4: uuid } = require('uuid')
const PostsModel = require('../models/posts.model')
const UsersModel = require('../models/users.model')
const ReservationsModel = require('../models/reservations.model')
const { pictureUpload, deleteFileUpload, upload, validateUpload, verifyToken, verifyRoles, sendEmail, generateCode, encryptPassword } = require('../lib/functions')
const { msgNewPost, postUpdated } = require('../lib/msg')

const uploadImgPost = upload('img', 500000, /png|jpg|jpeg/, 'posts_picture', 7)

router.get('/posts', verifyToken, verifyRoles(['Seller']), async (req, res) => {
    const { _id } = req.dataUser
    const posts = await PostsModel.find({idUser: _id}).exec()
    res.json(posts)
})

router.get('/posts/:id', verifyToken, verifyRoles(['Seller']), async (req, res) => {
    const { id } = req.params
    const post = await PostsModel.findOne({ _id: id })

    if (!post) return res.status(404).json({ message: 'Post not found' })

    res.json(post)
})

router.post('/posts', verifyToken, verifyRoles(['Seller']), validateUpload(uploadImgPost), async (req, res) => {
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
        hasSodas,
        hasIce,
        mineralWaters,
    } = req.body
    const { _id } = req.dataUser
    const files = req.files
    const images = []

    for(const file of files){
        const { secure_url, public_id } = await pictureUpload(file.path, 500, 500, 'posts_picture')
        images.push({ path: public_id, url: secure_url })
    }

    const newPost = new PostsModel({
        idUser: _id,
        title,
        subtitle,
        shortDescription,
        largeDescription,
        price: parseFloat(price),
        currency,
        images,
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
        hasSodas,
        hasIce,
        mineralWaters: parseInt(mineralWaters)
    })

    try {
        const admins = await UsersModel.find({role: 'Admin'}).exec()
        admins.map(async admin => {
            await sendEmail(admin.email, 'New Post From Boatabroad', msgNewPost(newPost._id))
        })
        await newPost.save()
        req.io.emit('newPost', newPost)
        res.json({ server: 'postCreated'})
    } catch(e) {
        console.error(e);
        await deleteFileUpload(images.map(image => image.path))
        res.status(500).json({ server: 'postNotCreated'})
    }
})

router.put('/posts/:idPost', verifyToken, verifyRoles(['Seller']), validateUpload(uploadImgPost), async (req, res) => {
    const { idPost } = req.params
    const user = req.dataUser
    const files = req.files
    const updatedImages = []

    for(const file of files){
        const { secure_url, public_id } = await pictureUpload(file.path, 500, 500, 'posts_picture')
        updatedImages.push({ path: public_id, url: secure_url })
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
        hasSodas,
        hasIce,
        mineralWaters,
        existingImageUrls = [],
    } = req.body

    const post = await PostsModel.findOne({ _id: idPost }).exec()
    if(post !== null && post.idUser === user._id) {
        const pathsToDelete = post.images.filter(image => !existingImageUrls.includes(image.url)).map(image => image.path)
        console.log('deleting files', pathsToDelete)
        const filesDeleted = await deleteFileUpload(pathsToDelete)
        const keptImages = post.images.filter(image => existingImageUrls.includes(image.url))
        updatedImages.push(...keptImages)

        if(filesDeleted) {
            try {
                const updated = await PostsModel.updateOne({ _id: idPost }, {
                    title,
                    subtitle,
                    shortDescription,
                    largeDescription,
                    price: parseFloat(price),
                    currency,
                    images: updatedImages,
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
                    hasSodas,
                    hasIce,
                    mineralWaters: parseInt(mineralWaters),
                    status: 'pending',
                })

                if (updated.modifiedCount === 1 && post.status !== 'pending') {
                    const admins = await UsersModel.find({ role: 'Admin' })
                    admins.forEach(admin => {
                        sendEmail(admin.email, 'Boat updated', postUpdated(user, post))
                    })
                }
            } catch(error) {
                console.error(error)
                await deleteFileUpload(updatedImages.map(image => image.path))
                return res.status(500).json({ server: 'postNotUpdated'})
            }

            res.json({server: 'postUpdated'})
        } else {
            await deleteFileUpload(updatedImages.map(image => image.path))
            res.status(500).json({server: 'postNotUpdated'})
        }
        
    } else {
        await deleteFileUpload(updatedImages.map(image => image.path))
        res.json({server: 'postNotExist'})
    }
})

router.delete('/posts/:postId', verifyToken, verifyRoles(['Seller']), async (req, res) => {
    const { postId } = req.params
    const { _id } = req.dataUser

    const post = await PostsModel.findOne({ _id: postId }).exec()

    if(post !== null && post.idUser === _id) {
        const boatIsReserved = await ReservationsModel.findOne({ postId }).exec()
        if(boatIsReserved === null) {
            const deletedFile = await deleteFileUpload(post.images.map(image => image.path))
            if(deletedFile) {
                const deletePost = await PostsModel.deleteOne({ _id: postId }).exec()
            
                if(deletePost.deletedCount === 1) res.json({server: 'deletedPost'}) 
                else res.json({server: 'deletedNotPost'})
            } else res.json({server: 'deletedNotPost'})
        } else res.json({server: 'postIsReservedItCannotBeDeleted'})
    } else res.json({server: 'postNotExist'})
})

router.post("/users", verifyToken, verifyRoles(['Seller']), async (req, res) => {
    const { name, surname, username, email, password, role } = req.body
    const user = req.dataUser
    const emailVerificationCode = `${uuid()}${uuid()}`.replace(/-/g, '').toUpperCase()
    const emailVerificationUrl = `${process.env.ApiUrl}/emailVerifications/${emailVerificationCode}`
    const securityCode = generateCode(6)
    const newUser = new UsersModel({
        parentUserId: user._id,
        name,
        surname,
        username,
        email,
        password: await encryptPassword(password),
        role,
        emailVerificationCode,
        securityCode,
    })

    try {
      await sendEmail(
        email,
        "Verify Email",
        `<label>Verify your email by going to this URL: </label> <a href="${emailVerificationUrl}">${emailVerificationUrl}</a>`
      )
      await newUser.save()
      res.json({ server: "userCreated" })
    } catch (e) {
      res.json({ server: "userNotCreated" })
    }
  })

module.exports= router