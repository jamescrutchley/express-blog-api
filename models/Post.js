const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = require("./Comment"); 

// comments field is an array of comment subdocuments.
const PostSchema = new Schema({
      title: { type: String, required: true },
      copy: { type: String, required: true },
      author: { type: Schema.Types.ObjectId, ref: "User", required: true },
      date: { type: Date, default: Date.now, index: true, required: true},
      tags: {type: Array, required: false},
      comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
      likes: [{ type: Schema.Types.ObjectId, ref: "User", required: false }],
      status: { type: String, enum: ['published', 'draft', 'deprecated'], default: 'draft', required: true },
    });

    
PostSchema.virtual("url").get(function () {
    return `./${this._id}`;
});

module.exports = mongoose.model("Post", PostSchema);