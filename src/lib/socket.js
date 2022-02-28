const socketIo = require('socket.io')
const events = require('./events')
const socketFunctions = {}


socketFunctions.sio = server => {
    return socketIo(server, {
        transport: ["polling"],
        cors: {
            origin: "*"
        }
    })
}

socketFunctions.socketConnection = io => {
    io.on('connection', socket => {
        console.log('connection', socket.id)
        events(io, socket)
    })
}

socketFunctions.socketMiddelware = io => (req, res, next) => {
    req.io = io
    next()
}

module.exports = socketFunctions