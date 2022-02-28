const router = require("express").Router()
const UsersModel = require("../models/users.model")
const { msgSecurityCode } = require('../lib/msg')
const jwt = require("jsonwebtoken")
const {
  encryptPassword,
  verifyPassword,
  sendEmail,
  generateCode,
} = require("../lib/functions")
require("dotenv").config()

router.post('/signIn', async (req, res) => {
    const { email, password } = req.body
    const user = await UsersModel.findOne({email}).exec()
    if(user !== null) {
        if(user.verifyEmail){
            const validPass = await verifyPassword(password, user.password)
            if(validPass) {
                jwt.sign({user}, process.env.JwtSecretKey, (err, token) => {
                    if(err) res.status(409).json({ server: 'errorServer'})
                    else {
                        const { _id, name, username, email, role, profilePicture } = user
                        const dataUser = {_id, name, username, email, role, profilePicture}
                        res.json({server: 'signIn', token, dataUser})
                    }
                })
            } else res.json({ server: 'userNotExist'})
        } else res.json({ server: 'accountNotVerify'})
    } else res.json({ server: 'userNotExist'})
})

router.post("/signUp", async (req, res) => {
  const { name, surname, username, email, password, role } = req.body
  const securityCode = generateCode(6)
  const newUser = new UsersModel({
    name,
    surname,
    username,
    email,
    password: await encryptPassword(password),
    role,
    securityCode,
  })

  if (!['Seller', 'User'].includes(role)) {
    return res.status(400).json({ error: { message: `Invalid role '${role}'` } })
  }

  try {
    await newUser.save()
    await sendEmail(
      email, 
      "Verify Email", 
      msgSecurityCode(name, 'Welcome to Boatabroad! In order to get started, you need to confirm your email address.', securityCode)
    )
    res.json({ server: "userRegister" })
  } catch (e) {
    console.error(e)
    res.json({ server: "userNotRegister" })
  }
})

router.put("/verifyEmail", async (req, res) => {
  const { securityCode } = req.body
  const user = await UsersModel.findOne({ securityCode }).exec()
  if (user !== null) {
    const updatePassword = await UsersModel.updateOne(
      { securityCode },
      { securityCode: generateCode(6), verifyEmail: true, timer: 60000 }
    )
    if (updatePassword.modifiedCount === 1) {
      await sendEmail(
        user.email,
        "Bienvenida A Boatabroad",
        `<h1>Bienvenid@ ${user.name} A Boatabroad</h1>`
      )
      res.json({ server: "accountVerify" })
    } else res.json({ server: "accountNotVerify" })
  } else res.json({ server: "securityCodeInvalid" })
})

router.post("/securityCode", async (req, res) => {
  const { email } = req.body
  const user = await UsersModel.findOne({ email }).exec()
  if (user !== null) {
    if (user.verifyEmail) {
      const securityCode = generateCode(6)
      await sendEmail(
        email,
        "Reset Password Code",
        msgSecurityCode(user.name, 'Reset password process. For security reasons, we do NOT store your password. So rest assured that we will never send your password via email.', securityCode)
      )
      const updateSecurityCode = await UsersModel.updateOne(
        { email },
        { securityCode }
      ).exec()
      if (updateSecurityCode.modifiedCount === 1)
        res.json({ server: "securityCodeSend" })
      else res.json({ server: "securityCodeNotSend" })
    } else res.json({ server: "userNotVerify" })
  } else res.json({ server: "userNotExist" })
})

router.put("/resetPassword", async (req, res) => {
  const { securityCode, newPassword } = req.body
  const user = await UsersModel.findOne({ securityCode }).exec()
  if (user !== null) {
    const updatePassword = await UsersModel.updateOne(
      { securityCode },
      {
        password: await encryptPassword(newPassword),
        securityCode: generateCode(6),
      }
    )
    if (updatePassword.modifiedCount === 1)
      res.json({ server: "updatedPassword" })
    else res.json({ server: "updatedNotPassword" })
  } else res.json({ server: "securityCodeInvalid" })
})

router.post("/newCode", async (req, res) => {
  const { email, subject } = req.body
  const securityCode = generateCode(6)
  await sendEmail(
    email,
    subject,
    `<label>Security Code</label><input type="text" value="${securityCode}" />`
  )
  const updatePassword = await UsersModel.updateOne(
    { email },
    { securityCode, $inc: { timer: 2 * 60 * 1000 } }
  )
  if (updatePassword.modifiedCount === 1) res.json({ server: "mailSent" })
  else res.json({ server: "unsentMail" })
})

router.get("/timer/:email", async (req, res) => {
  const email = atob(req.params.email)
  const user = await UsersModel.findOne({ email })

  if (!user) {
    return res.status(404).json({ server: "userNotFound" })
  }

  res.json({
    timer: user.timer,
  })
})

module.exports = router
