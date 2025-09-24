const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('./emailController');
const AppError = require('../utils/AppError');

exports.register = async (req, res, next) => {
  const { name, username, email, tp, password, type } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return next(new AppError('User already exists', 400));
    }

    user = new User({
      name,
      username,
      email,
      tp,
      type,
      password,
    });

    await user.save();

    // Generate access token (15 minutes)
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    // Generate refresh token (7 days)
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    // Store refresh token in the database
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set tokens in httpOnly cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      username: user.username,
      type: user.type,
    });

    // Send welcome email
    await sendWelcomeEmail({ recipient_email: email, username });
  } catch (error) {
    console.error('Registration failed:', error);
    next(new AppError('Server Error', 500));
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    if (!user.password) {
      return next(new AppError('This account uses Google login. Please sign in with Google.', 401));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Generate access token (15 minutes)
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    // Generate refresh token (7 days)
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    // Store refresh token in the database
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set tokens in httpOnly cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      username: user.username,
      type: user.type,
    });
  } catch (error) {
    console.error('Login failed:', error);
    next(new AppError('Server Error', 500));
  }
};

exports.refreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError('No refresh token provided', 401));
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if refresh token exists in the database
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return next(new AppError('Invalid refresh token', 403));
    }

    // Generate new access token
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    // Set new access token in cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Token refresh failed:', error);
    next(new AppError('Invalid or expired refresh token', 403));
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Remove refresh token from the database
      await User.findOneAndUpdate(
        { refreshTokens: refreshToken },
        { $pull: { refreshTokens: refreshToken } },
        { new: true }
      );
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout failed:', error);
    next(new AppError('Server Error', 500));
  }
};

exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    next(new AppError('Server Error', 500));
  }
};