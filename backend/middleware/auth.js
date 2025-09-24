const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      console.log('No accessToken cookie found');
      return next(new AppError('No token, authorization denied', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Token verified:', decoded);
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return next(new AppError('Invalid token', 401));
  }
};

module.exports = auth;