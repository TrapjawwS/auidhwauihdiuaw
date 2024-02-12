const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs')
function updatelog(inp) {
  var date = new Date()
  var fulldate = "at " + (date.getHours()) + ":" + date.getMinutes() + ", " + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + "[ "

fs.appendFile('log.txt',"\n" + fulldate + inp + " ]", (err) => {
    if (err) throw err;
})
}

function updatechatlog(use, mes) {
  var date = new Date()
  var fulldate = "at " + (date.getHours() - 4) + ":" + date.getMinutes() + ", " + date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear() + "[ "
  var fullmessage = use + ", " + "'" + mes + "'"

fs.appendFile('chatlog.txt',"\n" + fulldate + fullmessage + " ]", (err) => {
    if (err) throw err;
})
}

let userlist = []

io.emit('updateuserlist', userlist)
io.emit("sendlist", userlist)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  userlist = []
  io.emit('updateuserlist', userlist)
  socket.on('disconnect', () => {
    console.log('user disconnected');
    userlist = []
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
io.on('connection', (socket) => {
  socket.on('chat message', (msg, color, pfp, username) => {
    updatechatlog(username, msg)
    io.emit('chat message', msg, color, pfp, username);
  });
});

io.on('connection', (socket) => {
  user = null
  socket.on('usjoin', (use) => {
    user = use
    io.emit('server message', "{SERVER}: " + use + " has joined the chat.");
    updatelog(use)
  });
  socket.on("disconnect", () => {
    io.emit('updateuserlist', userlist)
    io.emit('server message', "{SERVER}: "+ user + " has left the chat.");
  })
});

io.on('connection', (socket) => {
  socket.on('finalizeuserlist', (user) => {
    userlist.push(user)
    console.log(userlist)
    io.emit("sendlist", userlist)
  });
});