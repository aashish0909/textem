const User = require('../models/userModel');
const FriendRequest = require('../models/friendRequest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: 'Username already used', status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: 'Email already used', status: false });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    const dataJWT = {
      user: {
        id: user._id,
      },
    };
    const data = await User.findById(user._id).select('-password');
    jwt.sign(
      dataJWT,
      process.env.JWT_SECRET,
      {
        expiresIn: 3600,
      },
      (err, token) => {
        if (err) throw err;
        return res.json({ success: true, token, user: data });
      }
    );
  } catch (err) {
    next(err);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: 'Incorrect username or password', status: false });

    const dataJWT = {
      user: {
        id: user._id,
      },
    };

    const data = await User.findById(user._id).select('-password');

    bcrypt.compare(password, user.password).then((isMatch) => {
      if (!isMatch)
        return res.json({ success: false, msg: 'Invalid Credentials' });

      jwt.sign(
        dataJWT,
        process.env.JWT_SECRET,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ success: true, token, user: data });
        }
      );
    });
  } catch (err) {
    next(err);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const avatarImage = req.body.image;
    await User.findByIdAndUpdate(userId, {
      isAvatarImageSet: true,
      avatarImage,
    });
    const userData = await User.findById(userId);
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (err) {
    next(err);
  }
};

module.exports.getuser = async (req, res) => {
  try {
    userID = req.user.id;
    const user = await User.findById(userID).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select([
      'email',
      'username',
      'avatarImage',
      '_id',
      'online',
    ]);
    return res.json(users);
  } catch (err) {
    next(err);
  }
};

module.exports.updateUserStatus = async (req, res) => {
  User.findOneAndUpdate(
    { username: req.body.username },
    { online: req.body.status },
    (err, user) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.status(200).json({ message: 'User status updated successfully' });
      }
    }
  );
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.user.id) return res.json({ msg: 'User id is required ' });
    onlineUsers.delete(req.user.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};

///FRIEND REQUESTS

module.exports.getFriends = async (req, res) => {
  const userID = req.user.id;
  const friends = await User.findById(userID).select('friendList');

  const friendList = await User.find({ _id: { $in: friends.friendList } });

  res.json(friendList);
};

module.exports.getNonFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const users = await User.find({
      _id: { $ne: userId },
      friendList: { $nin: [userId] },
    }).select(['_id', 'username']);

    const friendRequests = await FriendRequest.find({
      $or: [{ sender: userId }, { recipient: userId }],
      status: 'pending',
    });

    const friendRequestsParticipants = friendRequests.reduce(
      (acc, curr) => [...acc, curr.sender, curr.recipient],
      []
    );

    const notFriends = users.filter((user) => {
      const userIdString = user._id.toString();
      return !friendRequestsParticipants.some((participantId) =>
        participantId.equals(userIdString)
      );
    });

    res.status(200).json(notFriends);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

module.exports.sendFriendRequest = async (req, res) => {
  const userId = req.user.id;
  const { recipientId } = req.body;

  const foundFriendRequest = await FriendRequest.findOne({
    sender: userId,
    recipient: recipientId,
  });
  if (foundFriendRequest) {
    return res.status(400).send();
  }

  const newFriendRequest = new FriendRequest({
    sender: userId,
    recipient: recipientId,
    status: 'pending',
  });

  newFriendRequest
    .save()
    .then((result) => {
      res.status(201).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

module.exports.getFriendRequests = async (req, res) => {
  const requests = await FriendRequest.find({
    recipient: req.user.id,
    status: 'pending',
  }).populate('sender', 'username');

  const response = requests.map((request) => {
    return {
      _id: request._id,
      senderId: request.sender._id,
      senderUsername: request.sender.username,
      recipientId: request.recipient,
      status: request.status,
      friendshipParticipants: request.friendshipParticipants,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      __v: request.__v,
    };
  });

  res.status(200).send(response);
};

// get single friend request by id, returns true or false
// determines if current user has pending or existing
// friend request with owner of profile being viewed
module.exports.getFriendRequest = async (req, res) => {
  const { profileUserId } = req.body;
  const userId = req.user.id;

  const foundFriendRequest1 = await FriendRequest.findOne({
    sender: userId,
    recipient: profileUserId,
  });
  const foundFriendRequest2 = await FriendRequest.findOne({
    sender: profileUserId,
    recipient: userId,
  });
  let friendRequestAlreadyExists = false;
  if (foundFriendRequest1 || foundFriendRequest2) {
    friendRequestAlreadyExists = true;
  }
  res.send(friendRequestAlreadyExists);
};

module.exports.acceptFriendRequest = async (req, res) => {
  const recipientId = req.user.id;
  const { senderId } = req.body;
  const updatedSender = await User.findOneAndUpdate(
    { _id: senderId, friendList: { $nin: [recipientId] } },
    { $push: { friendList: recipientId } },
    { new: true }
  );
  const updatedRecipient = await User.findOneAndUpdate(
    { _id: recipientId, friendList: { $nin: [senderId] } },
    {
      $push: { friendList: senderId },
    },
    { new: true }
  );
  if (updatedRecipient) {
    const updatedFriendRequest = await FriendRequest.findOneAndUpdate(
      {
        sender: senderId,
        recipient: recipientId,
      },
      {
        $set: { status: 'accepted' },
        $push: { friendshipParticipants: [senderId, recipientId] },
      },
      { new: true }
    );

    const updatedRequests = await FriendRequest.find({
      recipient: req.user.id,
      status: 'pending',
    });
    res.status(200).send({
      updatedRequests: updatedRequests,
      updatedUserfriendList: updatedRecipient.friendList,
    });
  }
};

module.exports.rejectFriendRequest = async (req, res) => {
  const recipientId = req.user.id;
  const { senderId } = req.body;
  const deletedFriendRequest = await FriendRequest.findOneAndDelete({
    sender: senderId,
    recipient: recipientId,
  });

  const updatedRequests = await FriendRequest.find({
    recipient: recipientId,
    status: 'pending',
  });

  res.status(200).send({
    updatedRequests: updatedRequests,
  });
};

module.exports.unfriend = async (req, res) => {
  const userId = req.user.id;
  const { friendId } = req.body;

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $pullAll: { friendList: [friendId] } },
    { new: true }
  ).select('-password');
  const updatedFriend = await User.findOneAndUpdate(
    { _id: friendId },
    { $pullAll: { friendList: [userId] } },
    { new: true }
  ).select('-password');

  const deletedFriendRequest = await FriendRequest.findOneAndDelete({
    $and: [
      { friendshipParticipants: { $in: [friendId] } },
      { friendshipParticipants: { $in: [userId] } },
    ],
  });

  res.status(200).send({ updatedUser, updatedFriend });
};
