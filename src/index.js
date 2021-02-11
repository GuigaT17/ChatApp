const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {createDeflate} = require('zlib')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUserInRoom} = require('./utils/user')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New web socket connection')
    

    socket.on('join', ({username, room}, cb) => {
        const {error, user} = addUser({
            id: socket.id,
            username,
            room
        })
        if(error){
            return cb(error)
        }
        socket.join(room)

        socket.emit('msg', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('msg', generateMessage('Admin', user.username + ' has joined the channel!'))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        cb()
    })

    socket.on('sendMessage', (message, cb) => {
        const user = getUser(socket.id)
        if(user){
            const filter = new Filter()
            if(filter.isProfane(message)){
                return cb('Profanity is not allowed')
            }
            io.to(user.room).emit('msg', generateMessage(user.username, message))
            cb()
        }
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('msg', generateMessage('Admin', user.username + ' has disconnected from the channel!'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (data, cb) => {
        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('locationMsg', generateLocationMessage(user.username, 'https://google.com/maps?q=' + data.lat + ',' + data.long))
            cb()
        }
    })
})

server.listen(port, () => {
    console.log('Server is up and running on port ' + port);
})