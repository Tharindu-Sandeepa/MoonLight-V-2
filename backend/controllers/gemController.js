const Gem = require('../models/gemModel');
const AppError = require('../utils/AppError');
const sanitize = require("mongo-sanitize");

// Get gems
const getGem = (req, res, next) => {
    Gem.find()
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            // Pass the error to the global error handler
            next(new AppError('Failed to retrieve gems from the database.', 500));
        });
};

// Add gem function
const addGem = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { id, name, color, price, weight, category, voucherNo, supplierId } = sanitizedBody;

    // Validate required fields
    if (!id || !name || !color || !price || !weight || !category || !voucherNo || !supplierId) {
        return next(new AppError('All fields are required.', 400));
    }

    // Validate numeric fields
    if (typeof price !== 'number' || price <= 0) {
        return next(new AppError('Price must be a positive number.', 400));
    }

    if (typeof weight !== 'number' || weight <= 0) {
        return next(new AppError('Weight must be a positive number.', 400));
    }

    const newGem = new Gem({
        id: id,
        name: name,
        color: color,
        price: price,
        weight: weight,
        category: category,
        voucherNo: voucherNo,
        supplierId: supplierId,
    });

    newGem.save()
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            // Pass the error to the global error handler
            next(new AppError('Failed to add gem to the database.', 500));
        });
};

// Update function
const updateGem = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { id, name, color, price, weight, category, voucherNo, supplierId } = sanitizedBody;

    // Validate required ID field
    if (!id) {
        return next(new AppError('Gem ID is required.', 400));
    }

    // Validate numeric fields if provided
    if (price && (typeof price !== 'number' || price <= 0)) {
        return next(new AppError('Price must be a positive number.', 400));
    }

    if (weight && (typeof weight !== 'number' || weight <= 0)) {
        return next(new AppError('Weight must be a positive number.', 400));
    }

    Gem.updateOne({ id: id }, { 
        $set: { 
            name: name, 
            color: color, 
            price: price, 
            weight: weight, 
            category: category, 
            voucherNo: voucherNo, 
            supplierId: supplierId 
        } 
    })
        .then(response => {
            if (response.matchedCount === 0) {
                return next(new AppError('Gem not found.', 404));
            }
            res.json({ response });
        })
        .catch(error => {
            // Pass the error to the global error handler
            next(new AppError('Failed to update gem.', 500));
        });
};

// Delete function
const deleteGem = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { id } = sanitizedBody;

    // Validate required ID field
    if (!id) {
        return next(new AppError('Gem ID is required.', 400));
    }

    Gem.deleteOne({ id: id })
        .then(response => {
            if (response.deletedCount === 0) {
                return next(new AppError('Gem not found.', 404));
            }
            res.json({ response });
        })
        .catch(error => {
            // Pass the error to the global error handler
            next(new AppError('Failed to delete gem.', 500));
        });
};

exports.getGem = getGem;
exports.addGem = addGem;
exports.updateGem = updateGem;
exports.deleteGem = deleteGem;