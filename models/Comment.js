const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    date: { type: Date, default: Date.now, required: true },
    copy: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deprecated: { type: Boolean, default: false, required: true }
  });

  const Comment = mongoose.model('Comment', CommentSchema);


  module.exports = Comment;


