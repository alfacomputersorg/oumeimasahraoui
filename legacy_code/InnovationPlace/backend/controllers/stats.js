const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const async = require("async");

const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');

/**
 * GET /api/stats/general
 * General stats
 */
exports.getGeneral = (req, res, next) => {
  async.series({
    allPostsCount: (callback) => {
      Post.count((err, count) => {
        callback(null, count);
      });
    },
    pendingPostsCount: (callback) => {
      Post.find({verified: false}).count((err, count) => {
        callback(null, count);
      });
    },
    verifiedPostsCount: (callback) => {
      Post.find({verified: true}).count((err, count) => {
        callback(null, count);
      });
    },
    allUsersCount: (callback) => {
      User.count((err, count) => {
        callback(null, count);
      });
    },
    regularUsersCount: (callback) => {
      User.find({role: "user"}).count((err, count) => {
        callback(null, count);
      });
    },
    adminsCount: (callback) => {
      User.find({role: "admin"}).count((err, count) => {
        callback(null, count);
      });
    },
    authorsCount: (callback) => {
      User.find({role: "author"}).count((err, count) => {
        callback(null, count);
      });
    },
    ratingsCount: (callback) => {
      Rating.count((err, count) => {
        callback(null, count);
      });
    },
    commentsCount: (callback) => {
      Comment.count((err, count) => {
        callback(null, count);
      });
    },
    postsByMinute: (callback) => {
      Post.aggregate(
        {
          $group : { 
           _id : {
             year: { $year : "$createdAt" },
             month: { $month : "$createdAt" },
             day: { $dayOfMonth : "$createdAt" },
             hour: { $hour : "$createdAt" },
             minute: { $minute : "$createdAt" },
           },
           count : { $sum : 1 },
          }
       },
        { $sort: {"_id.year":1, "_id.month":1, "_id.day":1, "_id.hour":1, "_id.minute":1} }
      ).exec((err, result) => {
        callback(null, result);
      });
    },
    postsByHour: (callback) => {
      Post.aggregate(
        {
          $group : { 
           _id : {
             year: { $year : "$createdAt" },
             month: { $month : "$createdAt" },
             day: { $dayOfMonth : "$createdAt" },
             hour: { $hour : "$createdAt" },
           },
           count : { $sum : 1 }}
         },
          { $sort: {"_id.year":1, "_id.month":1, "_id.day":1, "_id.hour":1} }
      ).exec((err, result) => {
        callback(null, result);
      });
    },
    postsByDay: (callback) => {
      Post.aggregate(
        {
          $group : { 
           _id : {
             year: { $year : "$createdAt" },
             month: { $month : "$createdAt" },
             day: { $dayOfMonth : "$createdAt" },
           },
           count : { $sum : 1 }}
         },
        { $sort: {"_id.year":1, "_id.month":1, "_id.day":1} }
      ).exec((err, result) => {
        callback(null, result);
      });
    },
  }, (err, results) => {
    res.json({stats: results});
  });
}
