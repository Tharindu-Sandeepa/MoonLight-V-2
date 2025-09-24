const useMaterial = require('../models/useMaterialModel');
const AppError = require('../utils/AppError');

const getusemat = (req,res,next) => {
    useMaterial.find()
        .then(response => {
            res.json({response})
        })
        .catch(error => {
            next(new AppError('Failed to retrieve used materials.', 500));
        });
};

const addusemat = (req,res,next) => {
    const usematerial = new useMaterial({
        useId: req.body.useId,
        useName: req.body.useName,
      //  useType: req.body.useType,
        useWeight: req.body.useWeight,
        useDate: req.body.useDate,
        useReason: req.body.useReason,
    });
    usematerial.save()
        .then(response => {
            res.json({response})
        })
        .catch(error => {
            next(new AppError('Failed to add used material.', 500));
        });
}

const updateusemat = (req,res,next) => {
    const {useId,useName,/*useType,*/useWeight,useDate,useReason} = req.body;
    useMaterial.updateOne(
        {useId : useId}, 
        {
            $set: {
                useName: useName,
               // useType: useType,
                useWeight: useWeight,
                useDate: useDate,
                useReason: useReason
            }}
            )
        .then(response => {
            res.json({response})
        })
        .catch(error => {
            next(new AppError('Failed to update used material.', 500));
        });
}

const deleteusemat = (req,res,next) =>{
    const useId = req.body.useId;
    useMaterial.deleteOne({ useId: useId})
        .then(response => {
            res.json({response})
        })
        .catch(error => {
            next(new AppError('Failed to delete used material.', 500));
        });
}

exports.getusemat = getusemat;
exports.addusemat = addusemat;
exports.updateusemat = updateusemat;
exports.deleteusemat = deleteusemat;