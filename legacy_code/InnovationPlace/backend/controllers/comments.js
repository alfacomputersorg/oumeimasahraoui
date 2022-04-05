const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

/**
 * POST /api/posts/:postId/comments
 * Add a comment to a post
 */
exports.postCreate = (req, res, next) => {
  req.assert('body', 'body is required').notEmpty();

  console.log(req.body, req.files)

  const errors = req.validationErrors();

  if (errors) {
    return res.status(422).json(errors)
  }

  Post.findOne({_id: req.params.postId}).populate("").exec((err, post) => {
    if (err) {
      return next(err);
    }
    let comment = new Comment({_post: post._id, _user: req.user._id, body: req.body.body})
    comment.save((err, comment) => {
      post.comments.push(comment);
      post.save(() => {
        Post.findOne({_id: req.params.postId})
          .populate({path: "comments", model: "Comment", populate: {path: "_user", model: "User"}})
          .populate("user ratings").exec((err, _post) => {
          return res.json({post: _post.preparedForClient(req.user)});
        })
      })
    })
  });
};

/**
 * DELETE /api/posts/:id
 * Destroy a comment
 */
exports.deleteDestroy = (req, res, next) => {
  Comment.findOne({_id: req.params.id, _post: req.params.postId, _user: req.user._id}).remove((err) => {
    if (err) {
      return next(err);
    }
    Post.findOne({_id: req.params.postId})
      .populate({path: "comments", model: "Comment", populate: {path: "_user", model: "User"}})
      .populate("user ratings").exec((err, _post) => {
      return res.json({post: _post.preparedForClient(req.user)});
    })
  });
}
