const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const lodash = require("lodash");
const Post = require("./Post");
const Conversation = require("./Conversation");
const async = require("async");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  fullName: String,

  authToken: { type: String, unique: true },
  role:{
    type: String,
    enum: ["user", "admin", "author"],
    required: true,
  },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  postsCount: Number,
  pendingPostsCount: Number,
  verifiedPostsCount: Number,

  phoneNumber: String,
  facebookUrl: String,
  twitterUrl: String,
  linkedinUrl: String,

}, { timestamps: true });


/**
 * Auth Token middleware
 * Here we gonna set the authToken that will be used
 * to authenticate subsequent requests.
 *
 * Will only be fired when the user creates
 * a new account.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if(!user.authToken) {
    user.authToken = crypto.randomBytes(28).toString("hex");
  };
  return next();
})

/*
 * Sets the posts count
 */
userSchema.pre('save', function save(next) {
  const user = this;
  user.setPostCounts();
  return next();
})

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

userSchema.methods.preparedForClient = function preparedForClient() {
  const user = this

  const preparedUser = lodash.pick(user, [
    "_id",
    "email",
    "fullName",
    "role",
    "postsCount",
    "verifiedPostsCount",
    "pendingPostsCount",
    "phoneNumber",
    "facebookUrl",
    "twitterUrl",
    "linkedinUrl",
    "createdAt",
    "updatedAt",
  ]);
  preparedUser.gravatarUrl = this.gravatar(80);

  return preparedUser;
}

userSchema.methods.markAsAuthor = function markAsAuthor() {
  const user = this

  if(user.role === "user"){
    Post.find({user: user._id, verified: true}).exec((err, _posts) => {
      if(_posts && _posts.length >= 4){
        user.role = "author";
        user.save()
      }
    })
  }
}


userSchema.methods.createConversations = function createConversations() {
  const user = this;
  User.find((err, users) => {
    lodash.forEach(users, (_user) => {
      if(user._id.toString() !== _user._id.toString()){
        let conversation = new Conversation({
          _creator: user._id,
          _user: _user._id,
        });
        conversation.save();
        console.log("new Conversation", conversation);
      }
    })
  })
}
userSchema.methods.setPostCounts = function setPostCounts() {
  const user = this

  async.series({
    allPostsCount: (callback) => {
      Post.find({user: user._id}).count((err, count) => {
        callback(null, count);
      });
    },
    pendingPostsCount: (callback) => {
      Post.find({user: user._id, verified: false}).count((err, count) => {
        callback(null, count);
      });
    },
    verifiedPostsCount: (callback) => {
      Post.find({user: user._id, verified: true}).count((err, count) => {
        callback(null, count);
      });
    },
  }, (err, results) => {
    user.postsCount = results.allPostsCount;
    user.pendingPostsCount = results.pendingPostsCount;
    user.verifiedPostsCount = results.verifiedPostsCount;
    user.save()
  });
}

const User = mongoose.model('User', userSchema);

module.exports = User;
