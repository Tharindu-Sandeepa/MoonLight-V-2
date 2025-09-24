const Users = require('../models/User');
const bcrypt = require('bcrypt');
const { sendWelcomeEmail } = require('./emailController');
const AppError = require('../utils/AppError');
const sanitize = require("mongo-sanitize");
const mongoose = require("mongoose");

//getUsers
const getUsers = (req, res, next) => {
    Users.find()
        .select('-password') // Exclude password from response
        .then(response => {
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to retrieve users.', 500));
        })
};

// addUser
const addUser = async (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { name, username, email, tp, password, type } = sanitizedBody;

    // Validate required fields
    if (!name || !username || !email || !tp || !password || !type) {
        return next(new AppError('All fields are required.', 400));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(new AppError('Invalid email format.', 400));
    }

    // Validate password strength
    if (password.length < 6) {
        return next(new AppError('Password must be at least 6 characters long.', 400));
    }

    // Validate user type
    const validTypes = ['admin', 'user', 'staff']; // Adjust based on your types
    if (!validTypes.includes(type)) {
        return next(new AppError('Invalid user type.', 400));
    }

    try {
        // Check if user already exists
        const existingUser = await Users.findOne({ 
            $or: [{ email: email }, { username: username }] 
        });
        
        if (existingUser) {
            return next(new AppError('User with this email or username already exists.', 409));
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new Users({
            name: name,
            username: username,
            email: email,
            tp: tp,
            password: hashedPassword,
            type: type
        });

        const response = await user.save();
        
        // Send welcome email (non-blocking)
        try {
            await sendWelcomeEmail({ recipient_email: email, username: username });
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the request if email fails
        }
        
        res.json({ response });
    } catch (error) {
        next(new AppError('Failed to add user.', 500));
    }
};

const updateUser = async (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { id, name, email, tp, username, password, type } = sanitizedBody;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
        return next(new AppError('Invalid user ID format.', 400));
    }

    // Validate required fields
    if (!name || !email || !tp || !username || !type) {
        return next(new AppError('All fields except password are required.', 400));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(new AppError('Invalid email format.', 400));
    }

    // Validate user type
    const validTypes = ['admin', 'user', 'staff'];
    if (!validTypes.includes(type)) {
        return next(new AppError('Invalid user type.', 400));
    }

    try {
        const updateData = {
            name: name,
            email: email,
            tp: tp,
            username: username,
            type: type
        };

        // Only update password if provided
        if (password) {
            if (password.length < 6) {
                return next(new AppError('Password must be at least 6 characters long.', 400));
            }
            updateData.password = await bcrypt.hash(password, 10);
        }

        const response = await Users.updateOne(
            { _id: id },
            { $set: updateData }
        );
        
        if (response.matchedCount === 0) {
            return next(new AppError('User not found.', 404));
        }
        
        res.json({ response });
    } catch (error) {
        next(new AppError('Failed to update user.', 500));
    }
};

// delete user
const deleteUser = async (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { id } = sanitizedBody;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
        return next(new AppError('Invalid user ID format.', 400));
    }

    try {
        const response = await Users.deleteOne({ _id: id });
        
        if (response.deletedCount === 0) {
            return next(new AppError('User not found.', 404));
        }
        
        res.json({ response });
    } catch (error) {
        next(new AppError('Failed to delete user.', 500));
    }
};

//changepassword
const changepassword = async (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { email, password } = sanitizedBody;

    // Validate required fields
    if (!email || !password) {
        return next(new AppError('Email and password are required.', 400));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(new AppError('Invalid email format.', 400));
    }

    // Validate password strength
    if (password.length < 6) {
        return next(new AppError('Password must be at least 6 characters long.', 400));
    }

    try {
        // Find the user by email
        const user = await Users.findOne({ email });

        // Check if user exists
        if (!user) {
            return next(new AppError('User not found.', 404));
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password
        const response = await Users.updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        if (response.matchedCount === 0) {
            return next(new AppError('Failed to update password.', 500));
        }

        // Send success response
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        next(new AppError('Failed to change password.', 500));
    }
};

exports.changepassword = changepassword;
exports.getUsers = getUsers;
exports.addUser = addUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;