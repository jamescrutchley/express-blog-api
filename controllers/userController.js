const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const dotenv = require('dotenv');

dotenv.config();

function generateAccessToken(userId) {
    return jwt.sign(userId, process.env.TOKEN_SECRET, { expiresIn: '86400s' });
  }

exports.getHome = asyncHandler(async (req, res, next) => {
  res.send("home");
});

// get a specific user
exports.getUserById = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid user ID",
    });
  }

  const user = await User.findById(req.params.userId, "username").exec();

  if (user === null) {
    // No results.
    const err = new Error("User not found");
    err.status = 404;
    return next(err);
  }

  res.json(user);
});

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({}, "username").exec();

  if (users === null) {
    // No results.
    const err = new Error("No users found");
    err.status = 404;
    return next(err);
  }
  res.json(users);
});

exports.createUser = asyncHandler(async (req, res, next) => {
  //validate - check for uniqueness

  bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
    try {
      const user = new User({
        username: req.body.username,
        hashedPassword: hashedPassword,
        email: req.body.email,
        admin: false,
      });
      const result = await user.save();
      if (result) {
        res.status(201).json({
          status: "success",
          message: "User created successfully",
          data: {
            username: result.username,
            email: result.email,
            admin: result.admin,
        }
        });
      } else {
        res.status(500).json({
          status: "error",
          message: "Failed to create user",
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
          data: {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
          },
        });
      } else {
        return next(err);
      }
    }
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  try {
    const userToUpdate = await User.findById(req.params.userId);
    //if it exists, validate fields:
    if (userToUpdate) {
        console.log('user found')
      //validate...validate
      //if validation fails send back validation errors and bounce back client input data just as for createUser.

      if (req.body.username) {
        userToUpdate.username = req.body.username;
      }
      if (req.body.email) {
        userToUpdate.email = req.body.email;
      }
      if (req.body.admin) {
        userToUpdate.admin = req.body.admin;
      }
      if (req.body.password) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        userToUpdate.password = hashedPassword;
      }

      const updatedUser = await userToUpdate.save();
      res.status(200).json({
        status: "success",
        message: "User updated successfully",
        data: {
            username: updatedUser.username,
            email: updatedUser.email,
            admin: updatedUser.admin,
        }
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "User could not be updated",
      });
    }
  } catch (err) {
    next(err);
  }
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  //authentication
  //...
  try {
    const userToDelete = await User.findByIdAndDelete(req.params.userId).exec();
    if (userToDelete) {
      res.status(201).json({
        status: "success",
        message: "User deleted successfully",
        data: userToDelete,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "User could not be deleted",
      });
    }
  } catch (err) {
    next(err);
  }
});
