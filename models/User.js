const mongoose = require("mongoose");
const Schema = mongoose.Schema;


//optionally integrate w google sign-in:
//allow client to use google name as username or custom username.
const UserSchema = new Schema({
      username: { type: String, required: true },
      password: { type: String, required: true },
      email: { type: String, required: true },
    })

UserSchema.virtual("url").get(function () {
    return `./${this._id}`;
});
    

  module.exports = mongoose.model("User", UserSchema);