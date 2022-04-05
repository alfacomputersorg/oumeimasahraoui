const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const lodash = require("lodash");

const ratingSchema = new mongoose.Schema({
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  _post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true},
  rating: { type: Number, required: true},

}, { timestamps: true });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
