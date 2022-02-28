const events = (io, socket) => {
    socket.on('disconnect', () => {
        console.log('Discoonect', socket.id)
    })
}

module.exports = events