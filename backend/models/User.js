// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth users
  name: { type: String },
  tp: { type: Number },
  type: { type: String },
  googleId: { type: String }, // Store Google ID
  verificationCode: {
    type: String,
    default: null,
  },
  verificationCodeExpires: {
    type: Date,
    default: null,
  },
  refreshTokens: [{ type: String }], // New field to store refresh tokens
});

// Hash the password before saving (only if password is provided)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords (only for local auth)
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    return false; // No password means OAuth user, can't login with password
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);