const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const { v4: uuid } = require('uuid')
const path = require('path')
const fs = require('fs-extra')
const nodemailer = require('nodemailer')
const { v2: cloudinary } = require('cloudinary')
const uploader = cloudinary.uploader
require('dotenv').config()
const functions = {}
let memory = []

cloudinary.config(process.env.CLOUDINARY_URL);

functions.encryptPassword = async password => {
    try {
        const salt = await bcryptjs.genSalt(10)
        const hash = await bcryptjs.hash(password, salt)
        return hash
    } catch(e) {
        return null
    }
}

functions.verifyPassword = async (password, hash) => {
    try {
        const verifyPass = await bcryptjs.compare(password, hash)
        return verifyPass
    } catch(e) {
       return false
    }
}

functions.verifyToken = (req, res, next) => {
    try {
        const token = req.headers['authorization'].split(' ')[1]
        if(token !== undefined){
            jwt.verify(token, process.env.JwtSecretKey, (err, data) => {
                if(err) res.json({server: 'SessionExpired'}).status(403)
                else {
                    req.dataUser = data.user
                    next()
                }
            })
        } else {
            res.json({server: 'SessionExpired'}).status(409)
        }
    } catch(e) {
        res.sendStatus(409)
    }
} 

functions.verifyRoles = roles => (req, res, next) => roles.indexOf(req.dataUser.role) > -1 ? next() : res.sendStatus(403)

functions.pictureUpload = async (path, width, height, folder) => {
    const upload = await uploader.upload(path, {
        secure: true, 
        transformation: [{
            width,
            height,
        }],
        folder
    })
    const isDelitedFile = await functions.deleteOneFile(path)
    if(isDelitedFile) {
        const { secure_url, public_id } = upload
        return { secure_url, public_id }
    } return null
}

functions.storage = folder => multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../', 'assets', `${folder}`))
    },

    filename: (req, file, cb) => {
        cb(null, `${uuid()}.jpg`)
    }
})

functions.upload = (name, size, types, folder, files) => multer({
    storage: functions.storage(folder),
    limits: {
        fileSize: size
    },
    fileFilter: (req, file, cb) => {
        memory.push(file)
        const type = file.originalname.split('.')[1]
        if(memory.length > files) {
            cb('AmountOfFilesNotAllow', false)
        }
        else if(types.test(type)) {
            cb(null, true)
        }
        else {
            cb('fileNotAllowed', false)
        }
    }
}).array(name)

functions.validateUpload = upload => (req, res, next) => upload(req, res, (err) => {
    if(err === 'fileNotAllowed') {
        memory = []
        res.json({server: 'fileNotAllowed'})
    } else if(err === 'AmountOfFilesNotAllow') { 
        memory = []
        res.json({server: 'AmountOfFilesNotAllow'}) 
    } else if(err) {
        memory = []  
        if(err.code === 'LIMIT_FILE_SIZE')  {
            memory = []  
            res.json({server: 'fileTooLarge'}) 
        } else res.json({server: err})
    } else {
        memory = []
        next()
    }
})

functions.deleteOneFile = async path => {
    try {
        const file = await fs.existsSync(path)
        if(file) {
            await fs.unlink(path)
            return true
        } else return false
    } catch(e) {
        return false
    }
}

functions.deleteMultiFile = async paths => {
    try {
        paths.map(async path => {
            const file = await fs.existsSync(path)
            if(file) {
                await fs.unlink(path)
            }
        })
        return true
    } catch(e) {
        return false
    }
}

functions.deleteFileUpload = async publicIds => {
    try {
        let res = true
        publicIds.map(async publicId => {
            const { result } = await uploader.destroy(publicId)
            if(result === 'ok') res = true
            else res = false
        })
        return res
    } catch(e) {
        return false
    }
}

functions.sendEmail = async (to, subject, html) => {
    const trasport = nodemailer.createTransport({
        "service": "gmail",
        "auth": {
            "user": "boatabroadserver@gmail.com",
            "pass": "Alexander_1309"
        }
    })
    
    const message = await trasport.sendMail({
        from: "Boatabroad <boatabroadserver@gmail.com>",
        to,
        subject,
        html
    })
    
    return message
}

functions.generateCode = length => {
    const code = []
    for(let i = 0; i < length; i++) {
        const numRandom = Math.floor(Math.random() * (9 + 0) + 0)
        code.push(numRandom)
    }

    return parseInt(code.join(''))
}

functions.getReservedDays = (startDate, endDate) => {
    const date1 = new Date(startDate).getDate()
    const date2 = new Date(endDate).getDate()
  
    const reservedDays = parseInt(((((date2 - date1) / 1000) / 3600) / 24) + 1)
  
    if(reservedDays <= 0) return 0
    
    return reservedDays
}

functions.getFullPayment = (hours, extraHours = 0, price, damage=0, percentage = 1, currency='USD') => {
    const fullPayment = (((hours + extraHours) * price) / percentage) + damage
    const convert = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    })

    return convert.format(fullPayment)
}

module.exports = functions