const User = require("../models/userModel");
const FriendRequest = require("../models/friendRequest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });

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
    const data = await User.findById(user._id).select("-password");
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
      return res.json({ msg: "Incorrect username or password", status: false });

    const dataJWT = {
      user: {
        id: user._id,
      },
    };

    const data = await User.findById(user._id).select("-password");

    bcrypt.compare(password, user.password).then((isMatch) => {
      if (!isMatch)
        return res
          .status(400)
          .json({ success: false, msg: "Invalid Credentials" });

      jwt.sign(
        dataJWT,
        process.env.JWT_SECRET,
        { expiresIn: 3600 },
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
    const user = await User.findById(userID).select("-password");
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (err) {
    next(err);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.user.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.user.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};

module.exports.sendFriendRequest = async (req, res, next) => {
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
    status: "pending",
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

module.exports.getFriendRequests = async (req, res, next) => {
  const requests = await FriendRequest.find({
    recipient: req.user.id,
  });
  res.status(200).send(requests);
};

// get single friend request by id, returns true or false
// determines if current user has pending or existing
// friend request with owner of profile being viewed
module.exports.getFriendRequest = async (req, res, next) => {
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
        $set: { status: "accepted" },
        $push: { friendshipParticipants: [senderId, recipientId] },
      },
      { new: true }
    );

    const updatedRequests = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    });
    res.status(200).send({
      updatedRequests: updatedRequests,
      updatedUserFriendList: updatedRecipient.friendList,
    });
  }
  1;
};

module.exports.rejectFriendRequest = async (req, res) => {
  const recipientId = req.user.id;
  const senderId = req.body.sender;
  const deletedFriendRequest = await FriendRequest.findOneAndDelete({
    sender: senderId,
    recipient: recipientId,
  });

  const updatedRequests = await FriendRequest.find({
    recipient: req.tokenUser.userId,
    status: "pending",
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
  ).select("-password");
  const updatedFriend = await User.findOneAndUpdate(
    { _id: friendId },
    { $pullAll: { friendList: [userId] } },
    { new: true }
  ).select("-password");

  const deletedFriendRequest = await FriendRequest.findOneAndDelete({
    $and: [
      { friendshipParticipants: { $in: [friendId] } },
      { friendshipParticipants: { $in: [userId] } },
    ],
  });

  res.status(200).send({ updatedUser, updatedFriend });
};
