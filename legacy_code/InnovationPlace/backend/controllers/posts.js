const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const Post = require('../models/Post');
const Rating = require('../models/Rating');

/**
 * POST /api/posts
 * Create a new Post
 */
exports.postCreate = (req, res, next) => {
  req.assert('title', 'Title is required').notEmpty();

  console.log(req.body, req.files)

  const errors = req.validationErrors();

  if (errors) {
    return res.status(422).json(errors)
  }

  let post = new Post({
    title: req.body.title,
    body: req.body.body,
    user: req.user,
  });

  if(req.user.role === "user"){
    post.verified = false;
  }
  if(req.user.role === "admin"){
    post.verified = true;
  }
  if(req.user.role === "author"){
    post.verified = true;
  }

  if(req.files['image']){
    console.log(req.files['image'][0]);
    post.image = req.files['image'][0].filename
    post.imageOriginalName = req.files['image'][0].originalname
  }

  if(req.files['video']){
    post.video = req.files['video'][0].filename
    post.videoOriginalName = req.files['video'][0].originalname
  }
  if(req.files['pdf']){
    post.pdf = req.files['pdf'][0].filename
    post.pdfOriginalName = req.files['pdf'][0].originalname
  }

  post.save((err) => {
    if (err) {
      return res.status(422).json(err);
    }
    post.user.setPostCounts();
    return res.json({post: post.preparedForClient(req.user)});
  })
};

/**
 * POST /api/posts/:id
 * Update a post
 */
exports.putUpdate = (req, res, next) => {
  req.assert('title', 'Title is required').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(422).json(errors)
  }

  Post.findOne({_id: req.params.id})
    .populate({path: "comments", model: "Comment", populate: {path: "_user", model: "User"}})
    .populate("user ratings").exec((err, post) => {

    if (err) {
      return next(err);
    }

    if (post) {
      post.title = req.body.title;
      post.body = req.body.body;
      if(req.body.deleteImage == "true"){
        post.image = null;
        post.imageOriginalName = null;
      }
      if(req.body.deletePdf == "true"){
        post.pdf = null;
        post.imageOriginalPdf = null;
      }
      if(req.body.deleteVideo == "true"){
        post.video = null;
        post.imageOriginalVideo = null;
      }

      if(req.files['image']){
        console.log(req.files['image'][0]);
        post.image = req.files['image'][0].filename
        post.imageOriginalName = req.files['image'][0].originalname
      }

      if(req.files['video']){
        post.video = req.files['video'][0].filename
        post.videoOriginalName = req.files['video'][0].originalname
      }
      if(req.files['pdf']){
        post.pdf = req.files['pdf'][0].filename
        post.pdfOriginalName = req.files['pdf'][0].originalname
      }

      post.save((err) => {
        if (err) {
          return res.status(422).json(err);
        }
        return res.json({post: post.preparedForClient(req.user)});
      })
    } else {
      return res.status(404).json({reason: "post_not_found"});
    }
  });
};


/**
 * GET /api/posts/:id
 * Show single post
 */
exports.getShow = (req, res, next) => {
  Post.findOne({_id: req.params.id})
    .populate({path: "comments", model: "Comment", populate: {path: "_user", model: "User"}})
    .populate("user ratings").exec((err, post) => {

    if (err) {
      return next(err);
    }
    if (post) {
      post.incrementViewsCounter();
      return res.json({post: post.preparedForClient(req.user)})
    } else {
      return res.status(404).json({reason: "post_not_found"});
    }
  });
}

/**
 * DELETE /api/posts/:id
 * Destroy a post
 */
exports.deleteDestroy = (req, res, next) => {
  Post.findOne({_id: req.params.id}).populate("user ratings").exec((err, post) => {
    user = post.user;
    post.remove((err) => {
      if (err) {
        return next(err);
      }
      user.setPostCounts();
      return res.status(200).json({reason: "post_destroyed"});
    });
  });

}

/**
 * POST /api/posts/:id/rate
 * Rate a post
 */
exports.postHandleRating = (req, res, next) => {
  const userRating = +req.body.rating || 5;
  Post.findOne({_id: req.params.id})
    .populate({path: "comments", model: "Comment", populate: {path: "_user", model: "User"}})
    .populate("user ratings").exec((err, post) => {

    if (err) {
      return next(err);
    }

    // check if there is a rating already
    Rating.findOne({_post: req.params.id, _user: req.user._id}).exec((err, _rating) => {
      if(_rating){
        _rating.rating = userRating;
        _rating.save((err) => {
          if(err){
            next(err);
          } else {
            // Reget the post because we change one rating
            Post.findOne({_id: req.params.id})
              .populate({path: "comments", model: "Comment", populate: {path: "_user", model: "User"}})
              .populate("user ratings").exec((err, post) => {

                post.setStaticAverageRating();
              res.json({post: post.preparedForClient(req.user)});
            })
          }
        })
      } else {
        let newRating = new Rating({_post: req.params.id, _user: req.user._id, rating: userRating})
        newRating.save((err) => {
          if(err){
            next(err);
          } else {
            post.ratings.push(newRating);
            post.setStaticAverageRating();
            post.save((err, post) => { res.json({post: post.preparedForClient(req.user)}); })
          }
        })
      }
    })
  });
}

/**
 * POST /api/posts/:id/mark_as_verified
 * Rate a post
 */
exports.postMarkAsVerified = (req, res, next) => {
  const userRating = +req.body.rating || 5;
  Post.findOne({_id: req.params.id}).exec((err, post) => {

    if (err) {
      return next(err);
    }

    if(req.user.role === "admin" || req.user.role === "author"){
      post.verified = true
    }

    post.save((err) => {
      if(err){
        next(err)
      } else {
        Post.findOne({_id: req.params.id})
          .populate({path: "comments", model: "Comment", populate: {path: "_user", model: "User"}})
          .populate("user ratings").exec((err, post) => {

            post.user.markAsAuthor();
            res.json({post: post.preparedForClient(req.user)});
        })
      }
    })
  });
}

/**
 * GET /api/posts
 * GET /api/posts?ownPosts=true
 * All posts or all posts for a single user
 */
exports.getIndex = (req, res, next) => {
  let perPage = 3;
  let page = req.query["page"] || 1;

  let query = Post.find();

  if (req.query.keyword){
    query.where({$or: [
      {title:  new RegExp(req.query.keyword, "i")},
      {body:  new RegExp(req.query.keyword, "i")}
    ]})
  }

  // filtering by the 
  if (req.query.authorId){
    query.where("user").equals(req.query.authorId)
  }

  // there is not connected user
  // so show only the verified posts
  if(!req.user){
    query.where({verified: true});
  }

  // if the user want all posts
  // so we will not filter by verified
  if( req.user && req.query.allPosts === "true"){
    if(req.user.role === "admin" || req.user._id == req.query.authorId){
      // do not filter by verified
    } else {
      // the user has no right to view pending posts
      query.where({verified: true});
    }
  }


  if( req.user && req.query.authorId == req.user._id){
    // do not filter by veririfed if the current user
    // want to get his posts
  } else {
    if (req.query.verified === "true"){
      query.where({verified: true})
    }
    if (req.query.verified === "false"){
      query.where({verified: false})
      if(req.user && req.user.role !== "admin"){
        query.where("user").equals(req.user._id)
      }
    }
  }

  query
    .populate({path: "comments", model: "Comment", populate: {path: "_user", model: "User"}})
    .populate("user ratings")

  if(req.query.orderBy){
    query.sort({[req.query.orderBy]: "desc"})
  } else {
    query.sort({createdAt: "desc"})
  }

  query.skip(perPage * ( page -1 ));
  query.limit(perPage);

  query.exec((err, posts) => {

    if (err) {
      return next(err);
    }
    if (posts) {
      query.limit(1000000).skip(0).count().exec( (err, count) => {
        return res.json({
          posts: posts.map( (post) => { return post.preparedForClient(req.user)}),
          meta: {
            page: page,
            perPage: perPage,
            pagesCount: count / perPage,
            count: count,
          } 
        })
      })
    } else {
      return res.status(404).json({reason: "post_not_found"});
    }
  });
}
