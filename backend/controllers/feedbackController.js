const Feedback = require('../models/Feedback');
const AppError = require('../utils/AppError');
const sanitize = require("mongo-sanitize");
const mongoose = require("mongoose");

//get all the feedbacks
const getFeedback = (req, res, next) => {
    Feedback.find()
        .then(response => {
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to retrieve feedback.', 500));
        });
};

//add feedback
const addFeedback = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { id, User_ID, name, email, Jewelry_ID, Jewelry_Name, rating, feedback } = sanitizedBody;

    // Validate required fields
    if (!id || !User_ID || !name || !email || !Jewelry_ID || !rating) {
        return next(new AppError('Missing required fields.', 400));
    }

    // Validate rating is a number
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return next(new AppError('Rating must be a number between 1 and 5.', 400));
    }

    const feedbackObj = new Feedback({
        id: id,
        User_ID: User_ID,
        name: name,
        email: email,
        Jewelry_ID: Jewelry_ID,
        Jewelry_Name: Jewelry_Name,
        rating: rating,
        feedback: feedback,
    });
    
    feedbackObj.save()
        .then(response => {
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to add feedback.', 500));
        });
}

//update feedback
const updateFeedback = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { id, User_ID, name, email, Jewelry_ID, Jewelry_Name, rating, feedback } = sanitizedBody;

    // Validate required fields
    if (!id) {
        return next(new AppError('Feedback ID is required.', 400));
    }

    // Validate rating if provided
    if (rating && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
        return next(new AppError('Rating must be a number between 1 and 5.', 400));
    }

    Feedback.updateOne({ id: id }, { 
        $set: { 
            User_ID: User_ID, 
            name: name, 
            email: email, 
            Jewelry_ID: Jewelry_ID, 
            Jewelry_Name: Jewelry_Name, 
            rating: rating, 
            feedback: feedback 
        } 
    })
        .then(response => {
            if (response.matchedCount === 0) {
                return next(new AppError('Feedback not found.', 404));
            }
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to update feedback.', 500));
        });
}

//delete feedback
const deleteFeedback = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { id } = sanitizedBody;

    // Validate required field
    if (!id) {
        return next(new AppError('Feedback ID is required.', 400));
    }

    Feedback.deleteOne({ id: id })
        .then(response => {
            if (response.deletedCount === 0) {
                return next(new AppError('Feedback not found.', 404));
            }
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to delete feedback.', 500));
        });
}

exports.getFeedback = getFeedback;
exports.addFeedback = addFeedback;
exports.updateFeedback = updateFeedback;
exports.deleteFeedback = deleteFeedback;