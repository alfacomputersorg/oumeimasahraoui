const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const lodash = require("lodash");
const Message = require("./Message");
const async = require("async");

const conversationSchema = new mongoose.Schema({
  _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],

}, { timestamps: true });


conversationSchema.methods.preparedForClient = function preparedForClient() {
  const conversation = this

  const prepared = lodash.pick(conversation, [
    "_id",
    "createdAt",
    "updatedAt",
    "unviewedMessagesCount", // Injected by withUnviewedMessagesCount() function;
  ]);
  if(conversation._creator){
    prepared.creator = conversation._creator.preparedForClient()
  }
  if(conversation._user){
    prepared.user = conversation._user.preparedForClient()
  }

  return prepared;
}

conversationSchema.methods.messagesForUser = function messagesForUser(user, cb) {
  const conversation = this
  Message
    .find({_conversation: conversation._id, _owner: user._id})
    .populate("_sender _owner")
    .limit(40)
    .exec((err, _messages) => {
      let preparedMessages = lodash.map(_messages, (_message) => {
        return _message.preparedForClient();
      })
      cb(preparedMessages);
    })
}

conversationSchema.methods.withUnviewedMessagesCount = function withUnviewedMessagesCount(user, cb) {
  const conversation = this;

  Message.count({ _conversation: conversation._id, _owner: user._id, viewed: false }, (err, count) => {
    conversation.unviewedMessagesCount = count;
    cb(err, conversation);
  })
}

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
