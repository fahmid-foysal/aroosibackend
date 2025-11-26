const { createPost, getUsersPosts, newsFeed, createReact, createComment, allComment, allReact, report } = require("./posts.service");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const path = require("path");

module.exports = {
  addPost: (req, res) => {

    const body = req.body;
    body.image_path = req.files.image_path ? req.files.image_path[0].path : null;
    body.user_id = req.user.user.id;

      createPost(body, (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            status: "error",
            message: err.message || "Database connection error",
          });
        }

        return res.status(200).json({
          status: "success",
          message: "Post created successfully"
        });
      });
  },
  
  
    usersPosts: (req, res) => {
    user_id = req.user.user.id;

      getUsersPosts(user_id, (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            status: "error",
            message: err.message || "Database connection error",
          });
        }

        return res.status(200).json({
          status: "success",
          data: results
        });
      });
  },
  


getFeed: (req, res) => {
  const page = parseInt(req.query.page) || 1;  
  const limit = parseInt(req.query.limit) || 10; 
  const offset = (page - 1) * limit;
  userId = req.user.user.id;

  newsFeed({ limit, offset, userId }, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Database connection error",
      });
    }

    return res.status(200).json({
      status: "success",
      page,
      limit,
      total: results.total,
      data: results.data
    });
  });
},

  




  addReact: (req, res) => {


        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ status: "error", message: errors.array() });
    }

    const body = req.params;
    body.user_id = req.user.user.id;

      createReact(body, (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            status: "error",
            message: err.message || "Database connection error",
          });
        }

        return res.status(200).json({
          status: "success",
          message: "Post reacted successfully"
        });
      });
  },





  addComment: (req, res) => {

        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ status: "error", message: errors.array() });
    }

    const body = req.body;
    body.user_id = req.user.user.id;

      createComment(body, (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            status: "error",
            message: err.message || "Database connection error",
          });
        }

        return res.status(200).json({
          status: "success",
          message: "Commented successfully"
        });
      });
  },
  



  showReacts: (req, res) => {
  const page = parseInt(req.query.page) || 1;  
  const limit = parseInt(req.query.limit) || 10; 
  const offset = (page - 1) * limit;
  const post_id = req.query.post_id;

  if(post_id === null){
      return res
        .status(400)
        .json({ status: "error", message: "Post id is required" });    
  }


  allReact({ limit, offset, post_id }, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Database connection error",
      });
    }

    return res.status(200).json({
      status: "success",
      page,
      limit,
      total: results.total,
      data: results.data
    });
  });
},




  showComments: (req, res) => {
  const page = parseInt(req.query.page) || 1;  
  const limit = parseInt(req.query.limit) || 10; 
  const offset = (page - 1) * limit;
  const post_id = req.query.post_id;

  if(post_id === null){
      return res
        .status(400)
        .json({ status: "error", message: "Post id is required" });    
  }

  allComment({ limit, offset, post_id }, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        status: "error",
        message: err.message || "Database connection error",
      });
    }

    return res.status(200).json({
      status: "success",
      page,
      limit,
      total: results.total,
      data: results.data
    });
  });
},



  reportPost: (req, res) => {


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ status: "error", message: errors.array() });
    }

    const body = req.body;
    body.user_id = req.user.user.id;

      report(body, (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            status: "error",
            message: err.message || "Database connection error",
          });
        }

        return res.status(200).json({
          status: "success",
          message: "Post reported successfully"
        });
      });
  },




};