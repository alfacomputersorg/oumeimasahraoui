/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const multer = require('multer');
const cors = require('cors');
const lodash = require("lodash");

storage = multer.diskStorage({
  destination: path.join(__dirname, 'public', 'uploads'),
  filename: (req, file, cb) => {
    let now = (new Date).getTime();
    cb(null, `${now}-${file.originalname.split(" ").join("")}`);
  }
});

const upload = multer({storage})

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const userController = require('./controllers/user');
const postsController = require('./controllers/posts');
const conversationsController = require('./controllers/conversations');
const commentsController = require('./controllers/comments');
const statsController = require('./controllers/stats');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(cors());

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressValidator());
app.use(passport.initialize({session: false}));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
const server = app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});


// Websockets section
const io = require('socket.io').listen(server);
global.io = io;
io.on('connection', function (socket) {
  socket.on("join", (data) => {
    socket.join(data.room);
    if(data.room === "connected-users"){
      connectUser(data.userId, socket.id);
      emitConnectedUsersToAllUsers(socket);
    }
  });

  socket.on("get-connected-users", (data) => {
    emitConnectedUsers(socket);
  });

  socket.on("user-typing", (data) => {
    io.emit("user-typing", data);
  });

  socket.on("disconnect", () => {
    disconnectUser(socket.id);
    emitConnectedUsersToAllUsers(socket);
  })
});

const connectedUsers = {}
// future shape if users are connected:
// {
//   293847293847: [239842, 2938472, 283948], // UserId: [tab1, tab2, tab3]
//   239829300000: [283948],
// }
function connectUser(userId, socketId){
  if(lodash.isEmpty(connectedUsers[userId])){
    connectedUsers[userId] = [socketId];
    console.log('%s: %s', chalk.green('Connect user'), userId);
  } else {
    // user already connected so add socketId
    // to browser
    connectedUsers[userId].push(socketId);
    console.log('%s: %s', chalk.blue('Add socket to connected user'), userId);
  }
}
function disconnectUser(socketId){
  lodash.forEach(connectedUsers, (socketIds, userId) => {
    if(lodash.includes(socketIds, socketId)){
      // remove socketId from array of connected tabs
      console.log('%s: %s', chalk.red('Disconnect socket'), socketId);
      let index = socketIds.indexOf(socketId)
      socketIds.splice(index, 1);
    }

    // delete the {key: []} if it is empty
    // it means that the user has no connected tabs
    if(lodash.isEmpty(connectedUsers[userId])){ delete connectedUsers[userId] }
  })
}

function emitConnectedUsers(socket){
  socket.emit("connected-users", {ids: Object.keys(connectedUsers)})
}

function emitConnectedUsersToAllUsers(socket){
  socket.in("connected-users").emit("connected-users", {ids: Object.keys(connectedUsers)})
}



/***********************************
 ** Routes section
 ***********************************/


/**
 * Auth routes
 */
app.post('/api/login', userController.postLogin);
app.post('/api/signup', userController.postSignup);

/**
 * User routes.
 */
//public routes
app.get('/api/users', passportConfig.withCurrentUser, userController.getIndex);
app.get('/api/users/get_current_user', passportConfig.withCurrentUser, userController.getGetCurrentUser);

// needs authentication
app.get('/api/users/:id', passportConfig.withCurrentUser, userController.getShow);
app.put('/api/users/:id', passportConfig.isAuthenticated, userController.putUpdate);
app.put('/api/users/:id/update_password', passportConfig.isAuthenticated, userController.putUpdatePassword);

/**
 * Conversation routes
 */
app.get('/api/conversations', passportConfig.isAuthenticated, conversationsController.getIndex);
app.get('/api/conversations/:id', passportConfig.isAuthenticated, conversationsController.getShow);
app.post('/api/conversations/:id/messages',
  passportConfig.isAuthenticated, conversationsController.postCreateMessage);
app.post('/api/conversations/:id/mark_messages_as_viewed',
  passportConfig.isAuthenticated, conversationsController.postMarkMessagesAsViewed);


/**
 * Post routes
 */
//public
app.get('/api/posts', passportConfig.withCurrentUser, postsController.getIndex);
app.get('/api/posts/:id', passportConfig.withCurrentUser, postsController.getShow);

// needs authentication
app.post('/api/posts', upload.fields([
                        { name: 'image', maxCount: 1},
                        { name: 'video', maxCount: 1},
                        { name: 'pdf', maxCount: 1}
                      ]), passportConfig.isAuthenticated, postsController.postCreate);
app.put('/api/posts/:id', upload.fields([
                        { name: 'image', maxCount: 1},
                        { name: 'video', maxCount: 1},
                        { name: 'pdf', maxCount: 1}
                      ]), passportConfig.isAuthenticated, postsController.putUpdate);
app.delete('/api/posts/:id', passportConfig.isAuthenticated, postsController.deleteDestroy);
app.post('/api/posts/:id/rate', passportConfig.isAuthenticated, postsController.postHandleRating);
app.post('/api/posts/:id/mark_as_verified', passportConfig.isAuthenticated, postsController.postMarkAsVerified);
app.post('/api/posts/:postId/comments', passportConfig.isAuthenticated, commentsController.postCreate);
app.delete('/api/posts/:postId/comments/:id', passportConfig.isAuthenticated, commentsController.deleteDestroy);


/**
 * Stats
 */
app.get('/api/stats/general', passportConfig.isAuthenticated, statsController.getGeneral);




module.exports = app;
