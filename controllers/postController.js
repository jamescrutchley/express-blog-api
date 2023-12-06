const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const User = require("../models/User");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");

const postFields = ['title', 'copy', 'author', 'date', 'tags', 'comments', 'likes', 'status']

exports.getPostById = asyncHandler(async (req, res, next) => {
  const postId = req.params.postId;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid post ID",
    });
  }
  const post = await Post.findById(req.params.postId).populate("likes comments").exec();
  if (post === null) {
    // No results.
    const err = new Error("Post not found");
    err.status = 404;
    return next(err);
  }
  res.json(post);
});

exports.getAllPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({}).exec();

  if (posts === null) {
    // No results.
    const err = new Error("No posts found");
    err.status = 404;
    return next(err);
  }
  res.json(posts);
});

exports.createPost = asyncHandler(async (req, res, next) => {
  //REQUIRES AUTH SET UP.
  try {
    const post = new Post({
      title: "test",
      copy: "lorem ipsum",
      author: "656939e77065f16bf01a3199",
      date: new Date(),
      tags: ["tag 1"],
      comments: [],
      likes: [],
      status: "published",
    });
    const result = await post.save();
    if (result) {
      res.status(201).json({
        status: "success",
        message: "Post Published",
        data: result,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Failed to create post",
        data: post,
      });
    }
  } catch (err) {
    if (err.name === "ValidationError") {
      // Extract validation errors
      const validationErrors = {};
      for (const field in err.errors) {
        validationErrors[field] = err.errors[field].message;
      }

      res.status(422).json({
        status: "validation_error",
        message: "Validation failed",
        errors: validationErrors,
        data: post,
      });
    } else {
      return next(err);
    }
  }
});

exports.updatePost = asyncHandler(async (req, res, next) => {
  try {
    const postToUpdate = await Post.findById(req.params.postId);
    if (postToUpdate) {
        console.log('post found');
        //validate
        postFields.forEach(field => {
            if (req.body[field] !== undefined) {
              postToUpdate[field] = req.body[field];
            }
          })
          const updatedPost = await postToUpdate.save();
          res.status(200).json({
            status: "success",
            message: "Post updated successfully",
            data: updatedPost
          });
    } else {
        res.status(500).json({
          status: "error",
          message: "Post could not be updated",
        });
      }
    } catch (err) {
      next(err);
    }
  });



exports.deletePost = asyncHandler(async (req, res, next) => {
    //auth
  try {
    const postToDelete = await Post.findByIdAndDelete(req.params.postId).exec();
    if (postToDelete) {
        res.status(201).json({
          status: "success",
          message: "Post deleted successfully",
          deletedPost: postToDelete,
        });
      } else {
        res.status(500).json({
          status: "error",
          message: "Post could not be deleted",
        });
      }
    } catch (err) {
      next(err);
    }
  });
