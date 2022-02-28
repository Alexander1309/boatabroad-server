const express = require('express')
const http = require('http')
const { sio, socketConnection, socketMiddelware } = require('./lib/socket')
const cors = require('cors')
const morgan = require('morgan')
const Mongoose = require('mongoose')
require('dotenv').config()

const authRouter = require('./routers/auth.router')
const indexRouter = require('./routers/index.router')
const adminRouter = require('./routers/admin.router')
const sellerRouter = require('./routers/seller.router')
const chatRouter = require('./routers/chat.router')

const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = sio(server)
socketConnection(io)
const connection = Mongoose.connection

Mongoose.connect(process.env.MongoDB)
connection.on('error', () => console.log('A ocurrio un error al conectar la base de datos...'))
connection.once('open', () => console.log('Base de datos conectada :)'))

app.use(socketMiddelware(io))
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.use('/', indexRouter)
app.use('/auth/', authRouter)
app.use('/admin/', adminRouter)
app.use('/seller/', sellerRouter)
app.use('/chat/', chatRouter)

server.listen(port, () => console.log(`Server run on port ${port}`))