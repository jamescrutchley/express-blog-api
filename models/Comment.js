const CommentSchema = new Schema({
    date: { type: Date, default: Date.now, required: true },
    copy: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deprecated: { type: Boolean, default: false, required: true }
  });


  module.exports = mongoose.model("Comment", CommentSchema);