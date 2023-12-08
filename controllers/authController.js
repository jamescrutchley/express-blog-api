//for logging in...
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const dotenv = require("dotenv");
dotenv.config();


exports.login = asyncHandler(async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).exec();

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "User not found",
      });
    }

    bcrypt.compare(password, user.hashedPassword, function (err, passwordMatch) {
      if (err) {
        return next(err);
      }
      if (passwordMatch) {
        const token = jwt.sign(
          { sub: user._id, username: user.username, admin: user.admin },
          process.env.TOKEN_SECRET,
          { expiresIn: "24h" }
        );
        res.json({ success: true, message: "Logged in successfully", token });
    } else {
        return response.json({
          success: false,
          message: "passwords do not match",
        });
      }
    });
  } catch (err) {
    return next(err);
  }
});


exports.testAuth = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.json({message: 'please log in or sign up'})
    } else {
        console.log(req.user)
        res.json({message: 'auth successful', user: req.user.username})
    }
})

