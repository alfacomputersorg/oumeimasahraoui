const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const lodash = require("lodash");
const Rating = require('./Rating');
const Comment = require('./Comment');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String},
  verified: { type: Boolean, default: false},
  image: { type: String},
  imageOriginalName: { type: String},
  video: { type: String},
  videoOriginalName: { type: String},
  pdf: { type: String},
  pdfOriginalName: { type: String},
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating'}],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
  viewsCount: { type: Number, default: 0 },
  staticAverageRating: { type: Number, default: 0 },

}, { timestamps: true });


postSchema.methods.incrementViewsCounter = function incrementViewsCounter() {
  const post = this;
  post.viewsCount += 1;
  post.save();
}

postSchema.methods.setStaticAverageRating = function setStaticAverageRating() {
  const post = this;
  post.staticAverageRating = lodash.meanBy(post.ratings, (rt) => {return rt.rating} );
  post.save();
}

postSchema.methods.preparedForClient = function preparedForClient(currentUser) {
  const post = this

  let preparedPost = lodash.pick(post, [
    "_id", "title", "body", "verified",
    "image",
    "imageOriginalName",
    "video",
    "videoOriginalName",
    "pdf",
    "pdfOriginalName",
    "user",
    "comments",
    "createdAt",
    "updatedAt",
    "viewsCount",
    "staticAverageRating",
  ]);

  preparedPost.user = preparedPost.user.preparedForClient();

  if(post.image){ preparedPost.imageUrl = `http://localhost:3000/uploads/${post.image}` }
  if(post.video){ preparedPost.videoUrl = `http://localhost:3000/uploads/${post.video}` }
  if(post.pdf){ preparedPost.pdfUrl = `http://localhost:3000/uploads/${post.pdf}` }

  // ratings section
  if(currentUser){
    lodash.forEach(post.ratings, (_rating) => {
      if(_rating._user.toString() == currentUser._id.toString()){
        preparedPost.currentUserRating = _rating.rating;
      }
    })
  }
  preparedPost.averageRating = lodash.meanBy(post.ratings, (rt) => {return rt.rating} );
  preparedPost.ratingsCount = post.ratings.length;

  // comments section
  lodash.forEach(preparedPost.comments, (_comment, index) => {
    preparedPost.comments[index] = _comment.preparedForClient();
  })

  return preparedPost;
}

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
