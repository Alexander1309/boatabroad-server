const router = require('express').Router()
const UsersModel = require('../models/users.model')
const jwt = require('jsonwebtoken')
const { encryptPassword, verifyPassword, sendEmail, generateCode } = require('../lib/functions')
require('dotenv').config()

router.post('/signIn', async (req, res) => {
    const { email, password } = req.body
    const user = await UsersModel.findOne({email}).exec()
    if(user !== null) {
        if(user.verifyEmail){
            const validPass = await verifyPassword(password, user.password)
            if(validPass) {
                jwt.sign({user}, process.env.SecretKey, (err, token) => {
                    if(err) res.json({ server: 'errorServer'}).status(409)
                    else {
                        const { _id, name, username, email, role, profilePicture } = user
                        const dataUser = {_id, name, username, email, role, profilePicture}
                        res.json({server: 'signIn', token, dataUser}).status(200)
                    }
                })
            } else res.json({ server: 'userNotExist'}).status(200)
        } else res.json({ server: 'accountNotVerify'}).status(200)
    } else res.json({ server: 'userNotExist'}).status(200)
})

router.post('/signUp', async (req, res) => {
    const { name, username, email, password, role } = req.body
    const securityCode = generateCode(6)
    const newUser = new UsersModel({
        name,
        username,
        email,
        password: await encryptPassword(password),
        role,
        securityCode
    })

    try {
        await sendEmail(email, 'Verify Email', `<label>Security Code</label><input type="text" value="${securityCode}" />`)
        await newUser.save()
        res.json({ server: 'userRegister'}).status(200)
    } catch(e) {
        res.json({ server: 'userNotRegister'}).status(200)
    }
})

router.put('/verifyEmail', async (req, res) => {
    const { securityCode } = req.body
    const user = await UsersModel.findOne({ securityCode }).exec()
    if(user !== null) {
        const updatePassword = await UsersModel.updateOne({ securityCode }, { securityCode: generateCode(6), verifyEmail: true })
        if(updatePassword.modifiedCount === 1) {
            await sendEmail(user.email, 'Bienvenida A Boatabroad', `<h1>Bienvenid@ ${user.name} A Boatabroad</h1>`)
            res.json({server: 'accountVerify'})
        }
        else res.json({server: 'accountNotVerify'})
    } else res.json({server: 'securityCodeInvalid'})
})

router.post('/securityCode', async (req, res) => {
    const { email } = req.body
    const user = await UsersModel.findOne({ email }).exec()
    if(user !== null) {
        if(user.verifyEmail){
            const securityCode = generateCode(6)
            await sendEmail(email, 'Reset Password Code', `<label>Security Code</label><input type="text" value="${securityCode}" />`)
            const updateSecurityCode = await UsersModel.updateOne({ email }, { securityCode }).exec()
            if(updateSecurityCode.modifiedCount === 1) res.json({server: 'securityCodeSend'})
            else res.json({server: 'securityCodeNotSend'})
        } else res.json({server: 'userNotVerify'})
    } else res.json({server: 'userNotExist'})
})

router.put('/resetPassword', async (req, res) => {
    const { securityCode, newPassword } = req.body
    const user = await UsersModel.findOne({ securityCode }).exec()
    if(user !== null) {
        const updatePassword = await UsersModel.updateOne({ securityCode }, { password: await encryptPassword(newPassword), securityCode: generateCode(6) })
        if(updatePassword.modifiedCount === 1) res.json({server: 'updatedPassword'})
        else res.json({server: 'updatedNotPassword'})
    } else res.json({server: 'securityCodeInvalid'})
})

router.post('/newCode', async (req, res) => {
    const { email, subject } = req.body
    const securityCode = generateCode(6)
    await sendEmail(email, subject, `<label>Security Code</label><input type="text" value="${securityCode}" />`)
    const updatePassword = await UsersModel.updateOne({ email }, { securityCode })
    if(updatePassword.modifiedCount === 1) res.json({server: 'mailSent'})
    else res.json({server: 'unsentMail'})
})

module.exports = router