const mongoose = require('mongoose');

const plm = require('passport-local-mongoose');


mongoose.connect("mongodb://localhost:27017/pintersetProject")

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'post' }],
  // Other user-related fields can be added here
});

userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);



