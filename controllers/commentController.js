const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");

const commentFields = ["copy", "date", "author", "deprecated"];

exports.getCommentById = asyncHandler(async (req, res, next) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid post ID",
    });
  }
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid comment ID",
    });
  }
  const comment = await Comment.findById(commentId).exec();
  if (comment === null) {
    // No results.
    const err = new Error("Comment not found");
    err.status = 404;
    return next(err);
  }
  res.json(comment);
});

exports.getAllComments = asyncHandler(async (req, res, next) => {
  const postId = req.params.postId;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid post ID",
    });
  }
  const allComments = await Post.findById(postId, "comments")
    .populate("comments")
    .exec();
  if (allComments === null) {
    // No results.
    const err = new Error("Comment not found");
    err.status = 404;
    return next(err);
  }
  //any need to return _id of array?
  res.json(allComments.comments);
});

exports.createComment = asyncHandler(async (req, res, next) => {
  try {
    const postId = req.params.postId;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid post ID",
      });
    }
    const post = await Post.findById(postId).exec();

    if (post === null) {
      // No results.
      const err = new Error("Post not found");
      err.status = 404;
      return next(err);
    }

    // REQUIRES AUTH + VALIDATION

    const newComment = new Comment({
      date: new Date(),
      copy: req.body.copy,
      // need to setup jwt auth for this as for post author.
      author: "656939e77065f16bf01a3197",
      deprecated: false,
    });
    const savedComment = await newComment.save();

    post.comments.push(savedComment._id);
    const updatedPost = await post.save();
    console.log(updatedPost);

    res.json({
      status: "success",
      message: "Comment added successfully",
      updatedPost: updatedPost,
      newComment: savedComment,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      err: err,
    });
  }
});

exports.updateComment = asyncHandler(async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid post ID",
      });
    }
    const post = await Post.findById(postId).exec();

    if (post === null) {
      // No results.
      const err = new Error("Post not found");
      err.status = 404;
      return next(err);
    }

    const commentToUpdate = await Comment.findById(commentId).exec();
    if (commentToUpdate) {
      commentFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          commentToUpdate[field] = req.body[field];
        }
      });
      const updatedComment = await commentToUpdate.save();
      res.status(200).json({
        status: "success",
        message: "Comment updated successfully",
        data: updatedComment,
      });
    } else {
      const err = new Error("Comment not found");
      err.status = 404;
      return next(err);
    }
  } catch (err) {
    next(err);
  }
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const commentId = req.params.commentId;
        if (!mongoose.Types.ObjectId.isValid(postId)) {
          return res.status(400).json({
            status: "error",
            message: "Invalid post ID",
          });
        }
        const post = await Post.findById(postId).exec();
    
        if (post === null) {
          // No results.
          const err = new Error("Post not found");
          err.status = 404;
          return next(err);
        }
    
        const commentToDelete = await Comment.findByIdAndDelete(commentId).exec();
        if (commentToDelete) {
            res.status(200).json({
            status: "success",
            message: "Comment deleted successfully",
            deletedComment: commentToDelete,
          });
        } else {
          const err = new Error("Comment not found");
          err.status = 404;
          return next(err);
        }
      } catch (err) {
        next(err);
      }
});
