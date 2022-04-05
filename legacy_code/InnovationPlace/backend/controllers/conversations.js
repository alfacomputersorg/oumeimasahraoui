const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const async = require("async");
const lodash = require("lodash");

/**
 * GET /api/conversations
 */
exports.getIndex = (req, res, next) => {
  let query = Conversation.find().populate("_user _creator")

  query = query.where({$or: [
    {_creator:  req.user._id},
    {_user:  req.user._id}
  ]});

  query.exec((err, conversations) => {
    if (err) {
      return next(err);
    }
    if (conversations) {

      async.map(
        conversations,
        (cv, cb) => {
          return cv.withUnviewedMessagesCount(req.user, cb)
        },
        (err, preparedConversations) => {
          return res.json( {
            conversations: preparedConversations.map((conversation) => {
              return conversation.preparedForClient();
            })
          } );
        }
      );

    } else {
      return res.status(404).json({reason: "conversations_not_found"});
    }
  });
}

/**
 * GET /api/conversations/:id
 */
exports.getShow = (req, res, next) => {
  markMessagesAsViewed(req);

  Conversation.findOne({_id: req.params.id})
    .populate("_user _creator")
    .exec((err, conversation) => {

    if (err) {
      return next(err);
    }
    if (conversation) {
      conversation.messagesForUser(req.user, (messages) => {
        return res.json({
          conversation: conversation.preparedForClient(),
          messages,
        })
      })
    } else {
      return res.status(404).json({reason: "conversation_not_found"});
    }
  });
}

exports.postCreateMessage = (req, res, next) => {
  markMessagesAsViewed(req);

  Conversation.findOne({_id: req.params.id}).exec((err, conversation) => {
    /*
     * Message for the other user
     */

    let secondMessage = new Message({
      _conversation: req.params.id,
      _sender: req.user._id,
      _owner: () => {
        if(conversation._creator.toString() === req.user._id.toString()){
          return conversation._user;
        } else {
          return conversation._creator;
        }
      },
      messageBody: req.body.messageBody,
      viewed: false,
    });

    if(conversation._creator.toString() === req.user._id.toString()){
      secondMessage._owner = conversation._user;
    } else {
      secondMessage._owner = conversation._creator;
    }
    secondMessage.save( (err) => {
      if (err) {
        return next(err);
      }
      conversation.messages.push(secondMessage);
      Message.findOne({_id: secondMessage._id}).populate("_owner _sender").exec((err, _message) => {
        if(_message){
          // emit socket event
          global.io.emit("new-message", {message: _message.preparedForClient()})
        }
      });
    });


    /*
     * Message for the current user
     */
    let message = new Message({
      _conversation: req.params.id,
      _sender: req.user._id,
      _owner: req.user._id,
      messageBody: req.body.messageBody,
      viewed: true,
    });
    message.save((err) => {
      if (err) {
        return next(err);
      }
      conversation.messages.push(message);
      Message.findOne({_id: message._id}).populate("_owner _sender").exec((err, _message) => {
        if(_message){
          // emit socket event
          global.io.emit("new-message", {message: _message.preparedForClient()})

          // return normal http response
          return res.json({message: _message.preparedForClient()})
        }
      });
    });
  });
}

exports.postMarkMessagesAsViewed = (req, res, next) => {
  markMessagesAsViewed(req);
  return res.json({ok: true});
}

function markMessagesAsViewed(req){
  Message.find({_conversation: req.params.id, _owner: req.user._id}).exec((err, msgs) => { 
    lodash.map(msgs, (msg) => {
      msg.viewed = true;
      msg.save((err) => {
        if(err){
          console.log(err);
        }
      })
    })
  } );

}
