const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('static'));

app.get('/', (req, res) => {
    res.render('room', { roomID: '' });
});

io.on('connection', (socket) => {
    socket.on('join-room', (userID) => {
        socket.broadcast.emit('user-connected', userID);
        socket.on('disconnect', () => {
            socket.broadcast.emit('user-disconnected', userID);
        })
    });
})

server.listen(port);