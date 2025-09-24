const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const router = require('./routes/authRoutes');
const router2 = require('./routes/usersRoutes');
const jewlleryRoutes = require('./routes/jewlleryRoutes');
const supListRoute = require('../backend/routes/supListRoute');
const suproute = require('../backend/routes/suproute');
const router3 = require('./routes/ordersRoutes');
const router4 = require('./routes/feedbackRouter');
const imageRoutes = require('./routes/imageRoutes');
const inquiryRoute = require('./routes/inquiryRoute');
const gemrouter = require('./routes/gemRoutes');
const router6 = require('./routes/materialRouter');
const useRouter7 = require('./routes/useMaterialRouter');
const employeeRoutes = require('./routes/employee.route');
const emailRoutes = require('./routes/emailRoutes');
const AppError = require('./utils/AppError');
const errorHandler = require('./controllers/errorHandler'); // Import the new error handler
const passport = require('./config/passport');
const jwt = require('jsonwebtoken'); // Import jwt module
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config({ path: './.env' });

console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: !!process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: !!process.env.JWT_REFRESH_SECRET,
  MONGODB_URI: !!process.env.MONGODB_URI,
  GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
  PORT: process.env.PORT || 5002,
});

const app = express();

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
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Routes
app.use('/api', router);
app.use('/api/users', router2);
app.use('/api/user', require('./routes/users'));
app.use('/api/orders', router3);
app.use('/api', router4);
app.use('/api', suproute);
app.use('/api', supListRoute);
app.use('/api', gemrouter);
app.use('/api', inquiryRoute);
app.use('/api', router6);
app.use('/api', useRouter7);
app.use('/api/employees', employeeRoutes);
app.use('/api/email', emailRoutes);

// Jewellery and Image routes
app.use('/', jewlleryRoutes);
app.use('/get-images', jewlleryRoutes);
app.use('/upload-image', jewlleryRoutes);
app.use('/delete-image/:id', jewlleryRoutes);
app.use('/update-image/:id', jewlleryRoutes);
app.use('/get-item/:id', jewlleryRoutes);
app.use('/', imageRoutes);
app.use('/gemget-images', imageRoutes);
app.use('/gemupload-image', imageRoutes);
app.use('/gemdelete-image/:id', imageRoutes);
app.use('/gemupdate-image/:id', imageRoutes);


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
