const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const router = require('./router.js');

const PORT = process.env.PORT||5000;

const {addUser , removeUser , getUser , getUserInRoom} = require('./users.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);

io.on('connection',(socket) => {
    console.log('We have a new connection !');

    socket.on('join',({name,room} , callback) => {
        const {error , user } = addUser({ id: socket.id , name: name , room: room});
        if(error)
        {
            return callback(error);
        }

        socket.emit('message' , { user : 'Admin' , text : `${user.name} wellcome !!!`});

        socket.join(user.room);

        console.log(name,room);
    })

    socket.on('sendMessage' , (message , callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message' , { user : user.name , text : message});
        callback();
    })

    socket.on('disconnect',() =>{
        console.log('User disconnected');
        const user = removeUser(socket.id);
        
        if(user)
        {
            io.to(user.room).emit('message',{user: 'admin' , text : `${user.name} left the group`});
        }

    })
});



server.listen(PORT,() => (console.log(`Server has started on port ${PORT}`)));