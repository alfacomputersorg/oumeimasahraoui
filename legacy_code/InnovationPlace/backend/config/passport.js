const passport = require('passport');
const request = require('request');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Bearer token
 */
passport.use(
  new BearerStrategy(
    function(token, done) {
      User.findOne({ authToken: token },
        function(err, user) {
          if(err) {
            return done(err)
          }
          if(!user) {
            return done(null, false)
          }
          return done(null, user, { scope: 'all' })
        }
      );
    }
  )
);


/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { msg: `Email ${email} not found.` });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { msg: 'Invalid email or password.' });
    });
  });
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  passport.authenticate('bearer', { session: false }, function(err, user, info) {
    if (err) return next(err);
    if (user) {
      req.user = user;
      return next();
    } else {
      return res.status(401).json({reason: "not_authorized"});
    }
  })(req, res, next);
};


/**
 * Inject current user is there is any
 */
exports.withCurrentUser = (req, res, next) => {
  passport.authenticate('bearer', { session: false }, function(err, user, info) {
    if (err) return next(err);
    if (user) {
      req.user = user;
    }
    return next();
  })(req, res, next);
};



