const Gem = require('../models/gemModel');
const AppError = require('../utils/AppError');

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
    const newGem = new Gem({
        id: req.body.id,
        name: req.body.name,
        color : req.body.color,
        price : req.body.price,
        weight: req.body.weight,
        category: req.body.category,
        voucherNo: req.body.voucherNo,
        supplierId: req.body.supplierId,
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
    const { id, name, color, price, weight, category, voucherNo, supplierId } = req.body;
    Gem.updateOne({ id: id }, { $set: { name: name, color: color, price: price, weight: weight, category: category, voucherNo: voucherNo, supplierId: supplierId } })
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            // Pass the error to the global error handler
            next(new AppError('Failed to update gem.', 500));
        });
};

// Delete function
const deleteGem = (req, res, next) => {
    const id = req.body.id;
    Gem.deleteOne({ id: id })
        .then(response => {
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