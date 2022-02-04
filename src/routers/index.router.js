const router = require('express').Router()
const path = require('path')
const PostsModel = require('../models/posts.model')
const UsersModel = require('../models/users.model')
const { verifyToken, verifyRoles, upload, validateUpload, deleteFile } = require('../lib/functions')

const uploadProfilePicture = upload('profile_picture', 200000, /png|jpg|jpeg/, 'profile_picture')

router.get('/assets/:folder/:filename', (req, res) => {
    const { folder, filename } = req.params
    const pathFile = path.join(__dirname, '../', 'assets', `${folder}`, `${filename}`)
    res.sendFile(pathFile, (err) => {
        if(err) res.send('File not Exist').status(200)
        else res.status(200)
    })
})

router.get('/getPosts', verifyToken, verifyRoles(['User', 'Seller']), async (req, res) => {
    const posts = await PostsModel.find({ verifiedPost: true }).exec()
    res.json(posts)
})

router.get('/getPosts/:idPost', verifyToken, verifyRoles(['User', 'Seller']), async (req, res) => {
    const { idPost } = req.params
    const post = await PostsModel.findOne({ _id: idPost }).exec()
    res.json(post)
})

router.put('/uploadProfilePicture', verifyToken, verifyRoles(['User', 'Seller', 'Admin']), validateUpload(uploadProfilePicture), async (req, res) => {
    const { filename, path } = req.file
    const { _id } = req.dataUser

    const pathImg = await (await UsersModel.findOne({ _id }).exec()).pathPicture
    const urlImg = `http://localhost:3001/assets/profile_picture/${filename}`

    if(pathImg !== 'icon') {
        const deletedFile = await deleteFile(pathImg)
        if(deletedFile) {
            const updateProfilePicture = await UsersModel.updateOne({ _id }, { profilePicture: urlImg, pathPicture: path }).exec()
            if(updateProfilePicture.modifiedCount === 1) res.json({sevrer: 'updatedProfilePicture', urlImg})
            else {
                await deleteFile(path)
                res.json({server: 'updatedNotProfilePicture'})
            }
        } else {
            await deleteFile(path)
            res.json({server: 'updatedNotProfilePicture'})
        }
    } else {
        const updateProfilePicture = await UsersModel.updateOne({ _id }, { profilePicture: urlImg, pathPicture: path }).exec()
        if(updateProfilePicture.modifiedCount === 1) res.json({sevrer: 'updatedProfilePicture', urlImg})
        else {
            await deleteFile(path)
            res.json({server: 'updatedNotProfilePicture'})
        }
    }
})

router.delete('/deleteProfilePicture', verifyToken, verifyRoles(['User', 'Seller', 'Admin']), async (req, res) => {
    const { _id } = req.dataUser

    const pathImg = await (await UsersModel.findOne({ _id }).exec()).pathPicture

    if(pathImg !== 'icon') {
        const deletedFile = await deleteFile(pathImg)
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

module.exports = router