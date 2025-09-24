const supList = require('../models/supplierlist');
const AppError = require('../utils/AppError');
const sanitize = require("mongo-sanitize");
const mongoose = require("mongoose");

const getSupplier = (req, res, next) => {
    supList.find()
        .then(response => {
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to retrieve supplier list.', 500));
        });
};

const addSupplier = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { supName, Items, description } = sanitizedBody;

    // Validate required fields
    if (!supName || !Items) {
        return next(new AppError('Supplier name and items are required.', 400));
    }

    // Validate Items is an array and not empty
    if (!Array.isArray(Items) || Items.length === 0) {
        return next(new AppError('Items must be a non-empty array.', 400));
    }

    // Validate each item in the array
    for (let item of Items) {
        if (typeof item !== 'string' || item.trim() === '') {
            return next(new AppError('All items must be non-empty strings.', 400));
        }
    }

    const newSupplier = new supList({
        supName: supName,
        Items: Items,
        description: description,
    });
    
    newSupplier.save()
        .then(response => {
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to add new supplier.', 500));
        });
}

const updateSupplier = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { _id, supName, Items, description } = sanitizedBody;

    // Validate required ID field
    if (!_id) {
        return next(new AppError('Supplier ID is required.', 400));
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.isValidObjectId(_id)) {
        return next(new AppError('Invalid supplier ID format.', 400));
    }

    // Validate Items if provided
    if (Items && (!Array.isArray(Items) || Items.length === 0)) {
        return next(new AppError('Items must be a non-empty array.', 400));
    }

    // Validate each item in the array if provided
    if (Items) {
        for (let item of Items) {
            if (typeof item !== 'string' || item.trim() === '') {
                return next(new AppError('All items must be non-empty strings.', 400));
            }
        }
    }

    supList.updateOne({ _id: _id }, { 
        $set: { 
            supName: supName,
            Items: Items,
            description: description,
        }
    })
    .then(response => {
        if (response.matchedCount === 0) {
            return next(new AppError('Supplier not found.', 404));
        }
        res.json({ response })
    })
    .catch(error => {
        next(new AppError('Failed to update supplier.', 500));
    });
}

const deleteSupplier = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { _id } = sanitizedBody;

    // Validate required ID field
    if (!_id) {
        return next(new AppError('Supplier ID is required.', 400));
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.isValidObjectId(_id)) {
        return next(new AppError('Invalid supplier ID format.', 400));
    }

    supList.deleteOne({ _id: _id })
        .then(response => {
            if (response.deletedCount === 0) {
                return next(new AppError('Supplier not found.', 404));
            }
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to delete supplier.', 500));
        });
}

exports.getSupplier = getSupplier;
exports.addSupplier = addSupplier;
exports.updateSupplier = updateSupplier;
exports.deleteSupplier = deleteSupplier;