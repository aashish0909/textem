const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const socket = require('socket.io');
const path = require('path');

const app = express();
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const messagesRoute = require('./routes/messagesRoute');

const User = require('./models/userModel');

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connection Successful');
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use('/api/auth', userRoutes);
app.use('/api/messages', messagesRoute);

if (
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'staging'
) {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
  });
}

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Server started on Port ${process.env.PORT}`);
});

const io = socket(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on('connection', (socket) => {
  global.chatSocket = socket;

  socket.on('add-user', (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on('send-msg', (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('msg-receive', data.message);
    }
  });

  socket.on('update-user-status', (data) => {
    User.findOneAndUpdate(
      { username: data.username },
      { online: data.status },
      (err) => {
        if (err) {
          console.error(err);
        } else {
          io.emit('user-status-updated', data);
        }
      }
    );
  });

  socket.on('disconnect', (data) => {
    onlineUsers.delete(data.userId);
    User.findOneAndUpdate(
      { username: data.username },
      { online: data.status },
      (err) => {
        if (err) {
          console.error(err);
        } else {
          io.emit('user-status-updated', data);
        }
      }
    );
  });
});
