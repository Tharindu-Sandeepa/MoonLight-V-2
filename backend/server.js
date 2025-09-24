const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const jwt = require('jsonwebtoken');

// Load environment variables as early as possible
dotenv.config({ path: './.env' });

// Debug environment variables
console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: !!process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: !!process.env.JWT_REFRESH_SECRET,
  MONGODB_URI: !!process.env.MONGODB_URI,
  GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
  PORT: process.env.PORT || 5002,
});

// Import modules that depend on environment variables
const passport = require('./config/passport');
const AppError = require('./utils/AppError');
const errorHandler = require('./controllers/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const userRoutes = require('./routes/users');
const jewlleryRoutes = require('./routes/jewlleryRoutes');
const supListRoute = require('./routes/supListRoute');
const suproute = require('./routes/suproute');
const ordersRoutes = require('./routes/ordersRoutes');
const feedbackRouter = require('./routes/feedbackRouter');
const imageRoutes = require('./routes/imageRoutes');
const inquiryRoute = require('./routes/inquiryRoute');
const gemRoutes = require('./routes/gemRoutes');
const materialRouter = require('./routes/materialRouter');
const useMaterialRouter = require('./routes/useMaterialRouter');
const employeeRoutes = require('./routes/employee.route');
const emailRoutes = require('./routes/emailRoutes');

const app = express();

// CSRF protection middleware
const csurfProtection = csurf({
  cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' }
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(passport.initialize());

// Clear residual cookies on every request
app.use((req, res, next) => {
  res.clearCookie('token');
  res.clearCookie('username');
  res.clearCookie('type');
  res.clearCookie('next-auth.csrf-token');
  res.clearCookie('next-auth.callback-url');
  console.log('Cleared residual cookies:', req.cookies);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Routes that do not require CSRF protection (GET requests, static files, etc.)
app.use('/api', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/user', userRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api', feedbackRouter);
app.use('/api', suproute);
app.use('/api', supListRoute);
app.use('/api', gemRoutes);
app.use('/api', inquiryRoute);
app.use('/api', materialRouter);
app.use('/api', useMaterialRouter);
app.use('/api/employees', employeeRoutes);
app.use('/api/email', emailRoutes);

// Jewellery and Image routes
app.use('/', jewlleryRoutes);
app.use('/get-images', jewlleryRoutes);
app.use('/get-item/:id', jewlleryRoutes);
app.use('/', imageRoutes);
app.use('/gemget-images', imageRoutes);


// Route to get a new CSRF token
app.get('/api/csrf-token', csurfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Routes that require CSRF protection (POST, PUT, DELETE)
app.use('/upload-image', csurfProtection, jewlleryRoutes);
app.use('/update-image/:id', csurfProtection, jewlleryRoutes);
app.use('/delete-image/:id', csurfProtection, jewlleryRoutes);
app.use("/gemupload-image", csurfProtection, imageRoutes);
app.use("/gemdelete-image/:id", csurfProtection, imageRoutes);
app.use("/gemupdate-image/:id", csurfProtection, imageRoutes);


// Google Auth Routes
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Google Auth Callback
app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/login', session: false }),
  async (req, res, next) => {
    try {
      const User = require('./models/User');
      const accessToken = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: '15m',
      });
      const refreshToken = jwt.sign({ userId: req.user._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
      });

      // Store refresh token
      const user = await User.findById(req.user._id);
      user.refreshTokens.push(refreshToken);
      await user.save();

      // Clear old cookies
      res.clearCookie('token');
      res.clearCookie('username');
      res.clearCookie('type');
      res.clearCookie('next-auth.csrf-token');
      res.clearCookie('next-auth.callback-url');

      // Set tokens in httpOnly cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000,
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      console.log('Google callback cookies set:', {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      res.redirect(`http://localhost:3000/auth/callback?username=${encodeURIComponent(req.user.username)}&type=${encodeURIComponent(req.user.type)}`);
    } catch (error) {
      console.error('Error in Google callback:', error);
      next(error); // Pass the error to our global handler
    }
  }
);


// Unhandled routes handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// THIS IS THE GLOBAL ERROR HANDLER
// It must be placed after all other app.use() and app.all() calls
app.use(errorHandler);


const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));