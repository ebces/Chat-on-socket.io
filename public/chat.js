const socket = io.connect('http://localhost:3000');

const changeNameButton = document.querySelector('.change-name-area__button');
const changeNameInput = document.querySelector('.change-name-area__input');
const sendMessageButton = document.querySelector('.input-area__button');
const messageInput = document.querySelector('.input-area__input');
const chat = document.querySelector('.chat-history');
const usersOnline = document.querySelector('.online-users');
const currentUserName = document.querySelector('.change-name-area__user-name');
const typingMessage = document.querySelector('.typing');

let user = 'Anonymous';
let typingTimeout;

currentUserName.textContent = user;

const changeCurrentUserName = () => {
  user = changeNameInput.value || 'Anonymous';
  currentUserName.textContent = user;
  changeNameInput.value = '';
};

const createNewPost = (userName, messageValue, styles, date) => {
  const post = document.createElement('div');
  const name = document.createElement('p');
  const message = document.createElement('p');

  post.classList.add(styles);
  name.textContent = `${userName} ${date}`;
  message.textContent = messageValue;

  post.append(name);
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

  socket.emit('sendMessage', { messageValue: messageInput.value, date });

  createNewPost(user, messageInput.value, 'chat-history__my-post', date);
  chat.scrollTop = chat.scrollHeight;
  messageInput.value = '';
  messageInput.focus();
});

socket.on('newMessage', (data) => {
  const { username, message } = data;

  createNewPost(username, message.messageValue, 'chat-history__post', message.date);
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
