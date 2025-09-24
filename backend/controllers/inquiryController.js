const Inquiry = require('../models/inquiriesModel');
const AppError = require('../utils/AppError');
const sanitize = require("mongo-sanitize");
const mongoose = require("mongoose");

// enter Inquiry
const enterInquiry = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { name, email, message } = sanitizedBody;

    // Validate required fields
    if (!name || !email || !message) {
        return next(new AppError('Name, email, and message are required.', 400));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(new AppError('Invalid email format.', 400));
    }

    // Validate message length
    if (message.length < 10) {
        return next(new AppError('Message must be at least 10 characters long.', 400));
    }

    const newInquiry = new Inquiry({
        name: name,
        email: email,
        message: message,
    });
    
    newInquiry.save()
        .then(response => {  
            res.json({ response })  
        })
        .catch(error => {
            next(new AppError('Failed to save inquiry.', 500));
        });
}

//get
const getInquiry = (req, res, next) => {
    Inquiry.find()        // find()- the method that dispatch the data from db. the same as SQL SELECT function
        .then(response => {  //promiss
            res.json({ response })  // return as a JSON object
        })
        .catch(error => {
            next(new AppError('Failed to retrieve inquiries.', 500));
        });
};

//delete
const deleteInquiry = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { id } = sanitizedBody;

    // Validate required ID field
    if (!id) {
        return next(new AppError('Inquiry ID is required.', 400));
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.isValidObjectId(id)) {
        return next(new AppError('Invalid inquiry ID format.', 400));
    }

    Inquiry.deleteOne({ _id: id })
        .then(response => {  
            if (response.deletedCount === 0) {
                return next(new AppError('Inquiry not found.', 404));
            }
            res.json({ response })  
        })
        .catch(error => {
            next(new AppError('Failed to delete inquiry.', 500));
        });
}

exports.enterInquiry = enterInquiry;
exports.getInquiry = getInquiry;
exports.deleteInquiry = deleteInquiry;