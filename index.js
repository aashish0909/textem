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

  // Heartbeat implementation
  let heartbeatTimeout;
  function heartbeat() {
    clearTimeout(heartbeatTimeout);
    heartbeatTimeout = setTimeout(() => {
      // Client didn't respond, consider it disconnected
      const userId = getUserIdBySocketId(socket.id);
      if (userId) {
        onlineUsers.delete(userId);
        User.findOneAndUpdate({ _id: userId }, { online: false }, (err) => {
          if (err) {
            console.error(err);
          } else {
            // io.emit('user-status-updated', {
            //   username: getUsernameById(userId),
            //   status: false,
            // });
          }
        });
      }
      socket.disconnect(true); // Disconnect the socket
    }, 30000); // Heartbeat timeout
  }

  socket.on('heartbeat', () => {
    socket.emit('heartbeat-response');
    heartbeat();
  });

  socket.on('disconnect', (data) => {
    clearTimeout(heartbeatTimeout);
    const userId = getUserIdBySocketId(socket.id);
    if (userId) {
      onlineUsers.delete(userId);
      User.findOneAndUpdate({ _id: userId }, { online: false }, (err) => {
        if (err) {
          console.error(err);
        } else {
          // io.emit('user-status-updated', {
          //   username: getUsernameById(userId),
          //   status: false,
          // });
        }
      });
    }
  });

  function getUserIdBySocketId(socketId) {
    for (let [userId, id] of onlineUsers.entries()) {
      if (id === socketId) {
        return userId;
      }
    }
    return null;
  }

  function getUsernameById(userId) {
    // Implement your logic to get the username from the user id
  }
});
