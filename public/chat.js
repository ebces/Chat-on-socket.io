const socket = io.connect('http://localhost:3000');

const changeNameButton = document.querySelector('.change-name-area__button');
const changeNameInput = document.querySelector('.change-name-area__input');
const sendMessageButton = document.querySelector('.input-area__button');
const messageInput = document.querySelector('.input-area__input');
const chat = document.querySelector('.chat-history');
const usersOnline = document.querySelector('.online-users');
const currentUserName = document.querySelector('.change-name-area__user-name');
const typingMessage = document.querySelector('.typing');

const DEFAULT_COLOR = '#e7f5dc';
let user = 'Anonymous';
let typingTimeout;

currentUserName.textContent = user;

const changeCurrentUserName = () => {
  user = changeNameInput.value || 'Anonymous';
  currentUserName.textContent = user;
  changeNameInput.value = '';
};

const createNewPost = (messageData, stylesData) => {
  const { username, messageValue, date } = messageData;
  const { style, color } = stylesData;

  const post = document.createElement('div');
  const name = document.createElement('span');
  const time = document.createElement('span');
  const message = document.createElement('p');

  post.classList.add(style);
  name.style.fontWeight = 'bold';
  name.textContent = `${username} `;
  time.textContent = date;
  name.style.color = color;
  message.textContent = messageValue;

  post.append(name);
  post.append(time);
  post.append(message);
  chat.append(post);
};

changeNameButton.addEventListener('click', () => {
  socket.emit('changeUsername', changeNameInput.value);
  changeCurrentUserName();
});

sendMessageButton.addEventListener('click', () => {
  if (!messageInput.value) return;

  const date = new Date().toLocaleTimeString();
  const messageData = {
    username: user,
    messageValue: messageInput.value,
    date,
  };
  const stylesData = {
    style: 'chat-history__my-post',
    color: DEFAULT_COLOR,
  };

  socket.emit('sendMessage', { messageValue: messageInput.value, date });

  createNewPost(messageData, stylesData);
  chat.scrollTop = chat.scrollHeight;
  messageInput.value = '';
  messageInput.focus();
});

socket.on('newMessage', (data) => {
  const { username, message, color } = data;
  const messageData = {
    username,
    messageValue: message.messageValue,
    date: message.date,
  };

  const stylesData = {
    style: 'chat-history__post',
    color,
  };

  createNewPost(messageData, stylesData);
  chat.scrollTop = chat.scrollHeight;
});

socket.on('usersOnline', (data) => {
  usersOnline.textContent = `Users Online: ${data}`;
});

messageInput.addEventListener('keyup', () => {
  socket.emit('typing', `${user} is typing...`);
});

socket.on('userTyping', (data) => {
  typingMessage.textContent = data;
  if (typingTimeout) clearInterval(typingTimeout);

  typingTimeout = setTimeout(() => {
    typingMessage.textContent = '';
  }, 1000);
});
