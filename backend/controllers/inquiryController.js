const Inquiry = require('../models/inquiriesModel');
const AppError = require('../utils/AppError');

// enter Inquiry
const enterInquiry = (req, res, next) => {
    
    const newInquiry = new Inquiry({
        name : req.body.name,
        email : req.body.email,
        message : req.body.message,

    });
    newInquiry.save()
        .then(response =>{  
            res.json({ response})  
        })
        .catch(error => {
            next(new AppError('Failed to save inquiry.', 500));
        });
}

//get
const getInquiry = (req, res, next) => {
    Inquiry.find()        // find()- the method that dispatch the data from db. the same as SQL SELECT function
        .then(response =>{  //promiss
            res.json({ response})  // return as a JSON object
        })
        .catch(error => {
            next(new AppError('Failed to retrieve inquiries.', 500));
        });
};
//delete

const deleteInquiry= (req, res, next) => {
    const id = req.body.id;
    Inquiry.deleteOne({_id:id})
    .then(response =>{  
        res.json({ response})  
    })
    .catch(error => {
        next(new AppError('Failed to delete inquiry.', 500));
    });
}

exports.enterInquiry = enterInquiry;
exports.getInquiry = getInquiry;
exports.deleteInquiry = deleteInquiry;