const express = require('express');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

const server = app.listen('3000', () => console.log('Server is running...'));

const io = require('socket.io')(server);

const MIN_COLOR_NUMBER = 0;
const MAX_COLOR_NUMBER = 255;

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const messageToRestUsers = (socket, event, data) => {
  const { id } = socket;
  const connectedUsers = Object.keys(io.sockets.connected);
  connectedUsers.forEach((user) => {
    if (id !== user) io.sockets.connected[user].emit(event, data);
  });
};

io.on('connection', (socket) => {
  console.log('New user connected');

  const red = getRandomNumber(MIN_COLOR_NUMBER, MAX_COLOR_NUMBER);
  const green = getRandomNumber(MIN_COLOR_NUMBER, MAX_COLOR_NUMBER);
  const blue = getRandomNumber(MIN_COLOR_NUMBER, MAX_COLOR_NUMBER);

  const color = `rgb(${red}, ${green}, ${blue})`;

  io.sockets.emit('usersOnline', Object.keys(io.sockets.connected).length);

  socket.username = 'Anonymous';

  socket.on('changeUsername', (data) => {
    socket.username = data;
  });

  socket.on('sendMessage', (message) => {
    messageToRestUsers(socket, 'newMessage', { message, username: socket.username, color });
  });

  socket.on('typing', (data) => {
    messageToRestUsers(socket, 'userTyping', data);
  });

  socket.on('disconnect', () => {
    io.sockets.emit('usersOnline', Object.keys(io.sockets.connected).length);
  });
});
