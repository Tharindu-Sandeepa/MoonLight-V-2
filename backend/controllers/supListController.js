const supList = require('../models/supplierlist');
const AppError = require('../utils/AppError');

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
    const newSupplier = new supList({
        supName: req.body.supName,
        Items: req.body.Items,
        description: req.body.description,
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
    const { _id, supName, Items, description} = req.body;
    supList.updateOne({ _id: _id}, { 
        $set: { 
            supName: supName,
            Items: Items,
            description: description,
        }
    })
    .then(response => {
        res.json({ response })
    })
    .catch(error => {
        next(new AppError('Failed to update supplier.', 500));
    });
}

const deleteSupplier = (req, res, next) => {
    const _id = req.body._id;
    supList.deleteOne({ _id: _id})
        .then(response => {
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