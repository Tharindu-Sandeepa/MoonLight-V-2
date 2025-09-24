const useMaterial = require('../models/useMaterialModel');
const AppError = require('../utils/AppError');
const sanitize = require("mongo-sanitize");

const getusemat = (req, res, next) => {
    useMaterial.find()
        .then(response => {
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to retrieve used materials.', 500));
        });
};

const addusemat = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { useId, useName, useWeight, useDate, useReason } = sanitizedBody;

    // Validate required fields
    if (!useId || !useName || !useWeight || !useDate || !useReason) {
        return next(new AppError('All fields are required.', 400));
    }

    // Validate useWeight is a positive number
    if (typeof useWeight !== 'number' || useWeight <= 0) {
        return next(new AppError('Weight must be a positive number.', 400));
    }

    // Validate date format
    if (isNaN(Date.parse(useDate))) {
        return next(new AppError('Invalid date format.', 400));
    }

    // Validate useReason length
    if (useReason.length < 5) {
        return next(new AppError('Reason must be at least 5 characters long.', 400));
    }

    const usematerial = new useMaterial({
        useId: useId,
        useName: useName,
        useWeight: useWeight,
        useDate: useDate,
        useReason: useReason,
    });
    
    usematerial.save()
        .then(response => {
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to add used material.', 500));
        });
}

const updateusemat = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { useId, useName, useWeight, useDate, useReason } = sanitizedBody;

    // Validate required ID field
    if (!useId) {
        return next(new AppError('Used material ID is required.', 400));
    }

    // Validate useWeight if provided
    if (useWeight && (typeof useWeight !== 'number' || useWeight <= 0)) {
        return next(new AppError('Weight must be a positive number.', 400));
    }

    // Validate date format if provided
    if (useDate && isNaN(Date.parse(useDate))) {
        return next(new AppError('Invalid date format.', 400));
    }

    // Validate useReason length if provided
    if (useReason && useReason.length < 5) {
        return next(new AppError('Reason must be at least 5 characters long.', 400));
    }

    useMaterial.updateOne(
        { useId: useId }, 
        {
            $set: {
                useName: useName,
                useWeight: useWeight,
                useDate: useDate,
                useReason: useReason
            }
        })
        .then(response => {
            if (response.matchedCount === 0) {
                return next(new AppError('Used material not found.', 404));
            }
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to update used material.', 500));
        });
}

const deleteusemat = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { useId } = sanitizedBody;

    // Validate required ID field
    if (!useId) {
        return next(new AppError('Used material ID is required.', 400));
    }

    useMaterial.deleteOne({ useId: useId })
        .then(response => {
            if (response.deletedCount === 0) {
                return next(new AppError('Used material not found.', 404));
            }
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to delete used material.', 500));
        });
}

exports.getusemat = getusemat;
exports.addusemat = addusemat;
exports.updateusemat = updateusemat;
exports.deleteusemat = deleteusemat;