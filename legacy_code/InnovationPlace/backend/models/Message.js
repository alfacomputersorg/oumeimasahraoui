const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const lodash = require("lodash");
const async = require("async");

const messageSchema = new mongoose.Schema({
  _conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true},
  _sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  _owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  messageBody: {type: String, required: true},
  viewed: {type: Boolean, required: true, default: false},

}, { timestamps: true });


messageSchema.methods.preparedForClient = function preparedForClient() {
  const message = this

  const prepared = lodash.pick(message, [
    "_id",
    "_conversation",
    "messageBody",
    "viewed",
    "createdAt",
    "updatedAt",
  ]);
  if(message._sender){
    prepared.sender = message._sender.preparedForClient();
  }
  if(message._owner){
    prepared.owner = message._owner.preparedForClient()
  }

  return prepared;
}

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
