require('dotenv/config')
const express = require('express')
const cors = require('cors')
const fs = require('fs');
const path = require('path')
const dateFormat = require('dateformat');

app = express()
app.use(cors())

//const certificate = fs.readFileSync(path.join(__dirname, 'cert', 'selfsigned.crt'), 'utf8');
//const privateKey = fs.readFileSync(path.join(__dirname, 'cert', 'selfsigned.key'), 'utf8');

//const credentials = { key: privateKey, cert: certificate };

//const https = require('https').createServer(credentials, app);
const http = require('http').createServer(app);

const auth = require('./app/auth')
app.use('/auth', auth)

const multer = require('multer');
const formData = multer();
app.use(formData.array());

const userHandler = require('./lib/userHandler');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/info', (req, res) => {
    res.json({
        name: "API Server",
        version: "1.0.0"
    })
})

const io = require('socket.io')(http, {
    //path: '/test',
    cors: {
        origin: "*"
    }
});

app.get("/", function (req, res, next) {
    res.sendFile(__dirname + "/public/index.html");
});

http.listen(process.env.PORT, () => {
    console.log("Server running at https://0.0.0.0:" + process.env.PORT)
});

io.use(async (socket, next) => {
    let token = await socket.handshake.query.token;
    let isToken = await userHandler.verifyToken(token, socket);
    if (isToken) {
        socket.userData = isToken;
        return next();
    }
    return next(new Error('authentication error'));
});

io.on('connection', async (socket) => {


    console.log('User connected ' + socket.id);

    io.emit('userConnect', { socket_id: socket.id, id: socket.userData.id, email: socket.userData.email, is_online: 'ONLINE', last_seen: socket.userData.last_seen });

    socket.on('pingTest', (data) => {
        socket.emit('pongTest', data);
    });

    socket.on('sendMessage', (data) => {

        userHandler.userChatInput(data, (err, chatData) => {
            io.emit('test_data', { err });
            io.to(chatData.toSocket).emit('receiveMessage', chatData);
        });
    });

    socket.on('userTyping', (data) => {
        userHandler.getUserSocketId(data.receiverId, (err, data) => {
            if (!err) {
                io.to(data.socket_id).emit('userTyping');
            }
        })
    })

    socket.on('chatList', (data) => {
        userHandler.userChatList({ senderId: socket.userData.id, receiverId: data.receiverId }, (chatList) => {
            socket.emit('chatList', chatList.reverse());
        });
    });

    socket.on('seenMessage', (data) => {

        userHandler.seenMessage(data, (seenData) => {
            //console.log(seenData)
            io.to(seenData.senderSocketId).emit('seenMessage');
        });
    })

    socket.on('userList', (data) => {
        userHandler.userList({ userId: data.userId }, (userList) => {
            socket.emit('userList', userList);
        });
    });

    socket.on('disconnect', () => {
        let date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
        console.log('user disconnected ' + socket.id);
        io.emit('userDisconnect', { socket_id: null, id: socket.userData.id, email: socket.userData.email, is_online: 'OFFLINE', last_seen: date });
        userHandler.deleteUserToken(socket);
    });



});

