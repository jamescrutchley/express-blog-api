require("dotenv").config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose");


var commentRouter = require('./routes/commentRoutes');
var postRouter = require('./routes/postRoutes');
var userRouter = require('./routes/userRoutes');

const mongoDb = process.env.MONGODB_URI || process.env.DEV_URI;

mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));


var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', userRouter);
app.use('/posts', commentRouter);
app.use('/posts', postRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(express.json());

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // return error as json
  res.status(500).json({
    message: err.message,
    error: err
});
});

module.exports = app;
