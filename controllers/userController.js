const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const dotenv = require("dotenv");

const isUnique = require("../validation/isUnique");

dotenv.config();

// function generateAccessToken(userId) {
//     return jwt.sign(userId, process.env.TOKEN_SECRET, { expiresIn: '86400s' });
//   }

exports.getHome = asyncHandler(async (req, res, next) => {
  res.send("home");
});

// get a specific user
// auth case - if match - return email as well. (for profile page purposes - extend this later)
//      possibly split into a new route later if need arises
// non-auth case - return username and Id
exports.getUserById = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid user ID",
    });
  }

  const requestedUser = await User.findById(
    req.params.userId,
    "username email"
  ).exec();

  //check if the user exists
  if (requestedUser === null) {
    // No results.
    const err = new Error("User not found");
    err.status = 404;
    return next(err);
  }

  //check auth status and match. Return email as null if either false.
  if (req.user && req.user.userId === requestedUser._id.toString()) {
    console.log(req.user.userId);
    res.json(requestedUser);
  } else {
    res.json({
      _id: requestedUser._id,
      username: requestedUser.username,
      email: null,
    });
  }
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

//Create User logic:
// validate fields - return if invalid
// check uniqueness of email and username fields - return if false
// try creating new user w/ hashed password.

exports.createUser = [
  //validate input fields
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long"),
  body("email").trim().isEmail().withMessage("Invalid email address"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // once validated, if there are errors return them in response.
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: "validation_error",
        message: "Validation failed",
        errors: errors.array(),
        data: {
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
        },
      });
    }

    // check database for uniqueness of username and email fields
    const unique = await isUnique(User, [
      ["username", req.body.username],
      ["email", req.body.email],
    ]);

    if (!unique.isUnique) {
      return res.status(409).json({
        conflicts: unique.conflicts,
        message: unique.message,
      });
    }

    // hash the new user's password and try creating and saving the user.
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
            },
          });
          // respond with 500 if user cannot be created.
        } else {
          res.status(500).json({
            status: "error",
            message: "Failed to create user",
          });
        }
      } catch (err) {
        //(if validation error occurs here would suggest above express-validator validation is inadequate)
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
          // some other error.
        } else {
          return next(err);
        }
      }
    });
  }),
];

// Updating - logic:
// Validate&Sanitise email, password, username - return if invalid
// Check logged in status - return if false
//    req.params.userId === user.userId - return if false
// Check uniqueness in DB - return if false

//later - admin permissions (ability to reset password? )

exports.updateUser = [
  //validate fields upfront
  body("username")
    .trim()
    .optional()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("password")
    .trim()
    .optional()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long"),
  body("email")
    .trim()
    .optional()
    .isEmail()
    .withMessage("Invalid email address"),
  body("admin")
    .trim()
    .optional()
    .isIn([true, false])
    .optional()
    .withMessage("Admin must be true or false"),

  asyncHandler(async (req, res, next) => {
    // check auth status
    if (!req.user) {
      return res.status(401).json({ message: "Please log in or sign up" });
    }

    const errors = validationResult(req);

    // once validated, if there are errors return them in response.
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: "validation_error",
        message: "Validation failed",
        errors: errors.array(),
        data: {
          username: req.body.username,
          email: req.body.email,
          admin: req.body.admin,
        },
      });
    }

    // check database for uniqueness of username and email fields
    const unique = await isUnique(User, [
      ["username", req.body.username],
      ["email", req.body.email],
    ]);

    //added check here - values can exist on existing authenticated user but no other.
    if (
      !unique.isUnique &&
      unique.existingDocument._id.toString() !== req.user.userId
    ) {
      return res.status(409).json({
        conflicts: unique.conflicts,
        message: unique.message,
        existingUser: unique.existingDocument,
      });
    }

    try {
      // already running a uniqueness check - repeating myself(?)
      const userToUpdate = await User.findById(req.params.userId);
      //if it exists, validate fields:
      if (userToUpdate) {
        // if the authenticated user is attempting to update a user other than themselves
        if (userToUpdate._id.toString() !== req.user.userId) {
          return res
            .status(403)
            .json({ message: "You are not authorized to update this user" });
        }

        userToUpdate.username = req.body.username || userToUpdate.username;
        userToUpdate.email = req.body.email || userToUpdate.email;
        userToUpdate.admin = req.body.admin || userToUpdate.admin;

        if (req.body.password) {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
          userToUpdate.password = hashedPassword;
        }

        const updatedUser = await userToUpdate.save();

        if (updatedUser) {
          res.status(200).json({
            status: "success",
            message: "User updated successfully",
            data: {
              username: updatedUser.username,
              email: updatedUser.email,
              admin: updatedUser.admin,
            },
          });
        } else {
          return res.status(500).json({
            status: "error",
            message: "Failed to update user",
          });
        }
      } else {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
      }
    } catch (err) {
      next(err);
    }
  }),
];

//User deletion logic
// check logged in status - return if false
//     req.params.userId === user.userId - return if false
// jwt??

exports.deleteUser = asyncHandler(async (req, res, next) => {
    // authenticate user
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Please log in or sign up" });
    }
    // find requested user
    const userToDelete = await User.findById(req.params.userId).exec();
    // ensure requested user to delete is the authenticated user.
    // jwt - destroy on client side but presumably invalidate here as well?
    if (userToDelete && userToDelete._id.toString() === req.user.userId) {
        const deletedUser = await userToDelete.deleteOne()
        if (deletedUser) {
            res.status(201).json({
                status: "success",
                message: "User deleted successfully",
                data: userToDelete,
              });
        }
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
