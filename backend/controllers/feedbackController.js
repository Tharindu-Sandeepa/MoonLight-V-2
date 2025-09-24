const Feedback = require('../models/Feedback');
const AppError = require('../utils/AppError');


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
    const feedback = new Feedback({
        id: req.body.id,
        User_ID: req.body.User_ID,
        name: req.body.name,
        email: req.body.email,
        Jewelry_ID: req.body.Jewelry_ID,
        Jewelry_Name: req.body.Jewelry_Name,
        rating: req.body.rating,
        feedback: req.body.feedback,
    });
    feedback.save()
        .then(response => {
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to add feedback.', 500));
        });
}

//update feedback
const updateFeedback = (req, res, next) => {
    const { id, User_ID, name, email, Jewelry_ID, Jewelry_Name, rating, feedback } = req.body;
    Feedback.updateOne({ id: id }, { $set: { User_ID: User_ID, name: name, email: email, Jewelry_ID: Jewelry_ID, Jewelry_Name: Jewelry_Name, rating: rating, feedback: feedback } })
        .then(response => {
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to update feedback.', 500));
        });
}

//delete feedback
const deleteFeedback = (req, res, next) => {
    const { id } = req.body;
    Feedback.deleteOne({ id: id })
        .then(response => {
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