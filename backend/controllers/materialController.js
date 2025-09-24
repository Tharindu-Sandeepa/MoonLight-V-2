const Material = require('../models/materialModel');
const AppError = require('../utils/AppError');
const sanitize = require("mongo-sanitize");

const getmat = (req, res, next) => {
    Material.find()
        .then(response => {
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to retrieve materials.', 500));
        });
};

const addmat = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { id, name, weight, order, supplierID, cost, voucher, date, special } = sanitizedBody;

    // Validate required fields
    if (!id || !name || !weight || !order || !supplierID || !cost || !voucher || !date) {
        return next(new AppError('All fields are required.', 400));
    }

    // Validate numeric fields
    if (typeof weight !== 'number' || weight <= 0) {
        return next(new AppError('Weight must be a positive number.', 400));
    }

    if (typeof cost !== 'number' || cost <= 0) {
        return next(new AppError('Cost must be a positive number.', 400));
    }

    // Validate date format (basic check)
    if (isNaN(Date.parse(date))) {
        return next(new AppError('Invalid date format.', 400));
    }

    const material = new Material({
        id: id,
        name: name,
        weight: weight,
        order: order,
        supplierID: supplierID,
        cost: cost,
        voucher: voucher,
        date: date,
        special: special,
    });
    
    material.save()
        .then(response => {
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to add material.', 500));
        });
}

const updatemat = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { id, name, weight, order, supplierID, cost, voucher, date, special } = sanitizedBody;

    // Validate required ID field
    if (!id) {
        return next(new AppError('Material ID is required.', 400));
    }

    // Validate numeric fields if provided
    if (weight && (typeof weight !== 'number' || weight <= 0)) {
        return next(new AppError('Weight must be a positive number.', 400));
    }

    if (cost && (typeof cost !== 'number' || cost <= 0)) {
        return next(new AppError('Cost must be a positive number.', 400));
    }

    // Validate date format if provided
    if (date && isNaN(Date.parse(date))) {
        return next(new AppError('Invalid date format.', 400));
    }

    Material.updateOne(
        { id: id }, 
        {
            $set: {
                name: name,
                weight: weight,
                order: order,
                supplierID: supplierID,
                cost: cost,
                voucher: voucher,
                date: date,
                special: special
            }
        })
        .then(response => {
            if (response.matchedCount === 0) {
                return next(new AppError('Material not found.', 404));
            }
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to update material.', 500));
        });
}

const deletemat = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { id } = sanitizedBody;

    // Validate required ID field
    if (!id) {
        return next(new AppError('Material ID is required.', 400));
    }

    Material.deleteOne({ id: id })
        .then(response => {
            if (response.deletedCount === 0) {
                return next(new AppError('Material not found.', 404));
            }
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to delete material.', 500));
        });
}

exports.getmat = getmat;
exports.addmat = addmat;
exports.updatemat = updatemat;
exports.deletemat = deletemat;