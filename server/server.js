const express = require('express');
require('dotenv').config();
const app = express();
const dbConfig = require('./config/dbConfig');
const port = process.env.PORT || 5000;

const usersRouter = require('./routes/usersRoute');
const chatsRouter = require('./routes/chatsRoute');
const messagesRouter = require('./routes/messagesRoute');

// socket.io basic in server-side
app.use(express.json({ limit: '50mb' }));

const server = require('http').createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// check the socket connection from client
let onlineUsers = [];
io.on('connection', (socket) => {

    // sockets events will be here
    socket.on('join-room', (userId) => {
        socket.join(userId);
    });

    //send message to clients (who are present in the members array[])
    socket.on('send-message', (message) => {
        io.to(message.members[0])
            .to(message.members[1])
            .emit('receive-message', message);
    });

    // clear unread messages
    socket.on('clear-unread-messages', (data) => {
        io.to(data.members[0])
            .to(data.members[1])
            .emit('unread-messages-cleared', data);
    });

    // typing event
    socket.on('typing', (data) => {
        io.to(data.members[0])
            .to(data.members[1])
            .emit('started-typing', data);
    });

    // online-users event
    socket.on('came-online', (userId) => {

        if (!onlineUsers.includes(userId)) {
            onlineUsers.push(userId);
        }

        io.emit('online-users-updated', onlineUsers);
    });

    // went-offline
    socket.on("went-offline", (userId) => {
        onlineUsers = onlineUsers.filter((user) => user !== userId);
        io.emit("online-users-updated", onlineUsers);
    });

});


app.use('/api/users', usersRouter);
app.use('/api/chats', chatsRouter);
app.use('/api/messages', messagesRouter);


server.listen(port, () =>
    console.log(`Server is running on port ${port}`)
);