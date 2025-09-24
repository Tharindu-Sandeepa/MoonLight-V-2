const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../controllers/emailController');  
const AppError = require('../utils/AppError');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(new AppError('Failed to deserialize user.', 500));
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'  
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find user by Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // Check by email if Google ID not found
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link existing local user to Google
          user.googleId = profile.id;
          await user.save();
        } else {
          // Create new user
          user = new User({
            googleId: profile.id,
            username: profile.displayName.replace(/\s/g, '_').toLowerCase(),  // Simple username from display name
            email: profile.emails[0].value,
            name: profile.displayName,
            type: 'User',  // Default as in your register
            // No password needed
          });
          await user.save();

          // Send welcome email (as in your register)
          await sendWelcomeEmail({
            recipient_email: user.email,
            username: user.username
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(new AppError('Google authentication failed.', 500));
    }
  }
));

module.exports = passport;
