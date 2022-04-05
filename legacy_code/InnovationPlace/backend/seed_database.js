/**
 * Module dependencies.
 */
const chalk = require('chalk');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const User = require("./models/User.js");
const async = require("async");


/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

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

let admin = new User({
  fullName: "Omayma Sahraoui",
  email: "omayma@email.com",
  password: "password",
  role: "admin",
})
let admin2 = new User({
  fullName: "Hela Chalaabi",
  email: "hela@email.com",
  password: "password",
  role: "admin",
})

// drop database
mongoose.connection.once('connected', () => {
  mongoose.connection.db.dropDatabase(() => {
    async.each([admin, admin2], (item, cb) => {
      return item.save((err) => {
        if(err){
          console.log('%s', chalk.red(`Admin ${item.fullName} failed`, err));
        } else {
          console.log('%s', chalk.green(`Admin ${item.fullName} has been created`));
          cb(err, item);
        }
      })
    }, () => {
      admin.createConversations();
      setTimeout(() => {
        mongoose.disconnect();
      }, 1000)
    })
  })
})
