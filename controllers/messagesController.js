const Message = require("../models/messageModel");

module.exports.addMessage = async (req, res, next) => {
  try {
    const from = req.user.id;
    const { to, message } = req.body;
    const data = await Message.create({
      message: { text: message },
      user: [from, to],
      sender: from,
    });
    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (err) {
    next(err);
  }
};

module.exports.getAllMessages = async (req, res, next) => {
  try {
    const from = req.user.id;
    const { to } = req.body;
    const messages = await Message.find({
      user: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });
    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    res.json(projectedMessages);
  } catch (err) {
    next(err);
  }
};
