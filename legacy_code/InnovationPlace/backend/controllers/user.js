const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');

/**
 * POST /api/login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.status(422).json({errors: [{param: "base", msg: "Invalid email password combination"}]})
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      return res.status(422).json({errors: [{param: "base", msg: "Invalid email password combination"}]})
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.json({user: user.preparedForClient(), authToken: user.authToken || ""})
    });
  })(req, res, next);
};

/**
 * PUT /api/users/:id
 * Updates a user basic informations
 */
exports.putUpdate = (req, res, next) => {
  req.assert('fullName', 'Full name is rquired').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.status(422).json({errors})
  }

  User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) { return next(err); }
    if (!user) {
      return res.status(404).json({reason: "user_not_found"})
    }
    user.email = req.body.email
    user.fullName = req.body.fullName

    user.phoneNumber = req.body.phoneNumber
    user.facebookUrl = req.body.facebookUrl
    user.twitterUrl = req.body.twitterUrl
    user.linkedinUrl = req.body.linkedinUrl

    user.save((err) => {
      if (err) {
        return res.status(422).json(err)
      }
      return res.json({user: user.preparedForClient()})
    });
  });
};

/**
 * PUT /api/users/:id/update_password
 * Updates user password
 */
exports.putUpdatePassword = (req, res, next) => {
  req.assert('currentPassword', 'currentPassword must be provided').notEmpty();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('passwordConfirmation', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    return res.status(422).json({errors})
  }

  User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) { return next(err); }
    if (!user) {
      return res.status(404).json({reason: "user_not_found"})
    }

    user.comparePassword(req.body.currentPassword, (err, isMatch) => {
      if (err) { return next(err); }

      if (isMatch) {
        user.password = req.body.password
        user.save((err) => {
          if (err) {
            return res.status(422).json(err)
          }
          return res.json({user: user.preparedForClient()})
        });
      } else {
        return res.status(422).json({errors: [{param: "currentPassword", msg: "invalid"}]})
      }

    });
  });
};

/**
 * POST /signup
 * Create a new account.
 */
exports.postSignup = (req, res, next) => {
  req.assert('fullName', 'Full name is rquired').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('passwordConfirmation', 'Passwords do not match').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.status(422).json({errors})
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    fullName: req.body.fullName,
    role: "user",
  });

  // checks if there is a user with the some email
  // so we do not store duplicate emails
  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      return res.status(422).json({errors: [{param: "email", msg: "already_used"}]})
    }
    user.save((err) => {
      if (err) {
        return res.status(422).json(err)
      }
      // create related conversations
      user.createConversations();

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({user: user.preparedForClient(), authToken: user.authToken || ""})
      });
    });
  });
};

/**
 * GET /api/users/get_current_user
 * Get the current user
 */
exports.getGetCurrentUser = (req, res, next) => {
  const user = req.user;
  if(user){
    return res.json({user: user.preparedForClient(), authToken: user.authToken})
  } else {
    return res.status(404).json({reason: "user_not_found"});
  }
}

/**
 * GET /api/users/:id
 * Show single user
 */
exports.getShow = (req, res, next) => {
  User.findOne({_id: req.params.id}, (err, user) => {
    if (err) {
      return next(err);
    }
    if (user) {
      return res.json({user: user.preparedForClient()})
    } else {
      return res.status(404).json({reason: "user_not_found"});
    }
  });
}

/**
 * GET /api/users
 * All users
 */
exports.getIndex = (req, res, next) => {
  User.find({}).exec((err, users) => {
    if (err) {
      return next(err);
    }
    if (users) {
      return res.json({users: users.map( (user) => { return user.preparedForClient()}) })
    }
  });
}
