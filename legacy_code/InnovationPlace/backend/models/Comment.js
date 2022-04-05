const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const lodash = require("lodash");

const commentSchema = new mongoose.Schema({
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  _post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true},
  body: { type: String, required: true},

}, { timestamps: true });

commentSchema.methods.preparedForClient = function preparedForClient() {
  const comment = this;

  let preparedComment = lodash.pick(comment, [
    "_id", "body",
    "_user",
    "createdAt",
    "updatedAt",
  ]);

  preparedComment._user = preparedComment._user.preparedForClient();

  return preparedComment;
}

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
