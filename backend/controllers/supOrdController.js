const supOrder = require('../models/supOrder');
const AppError = require('../utils/AppError');


const getOrders = (req, res, next) => {
    supOrder.find()
        .then(response => {
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to retrieve supplier orders.', 500));
        });
};

const addsupOrder = (req, res, next) => {
    const newSupOrder = new supOrder({
        supOrdId: req.body.supOrdId,
        supName: req.body.supName,
        type: req.body.type,
        quantity: req.body.quantity,
        supID: req.body.supID,
        matID: req.body.matID,
        gemID: req.body.gemID,
        description: req.body.description,
        status: req.body.status,
    });
    newSupOrder.save()
        .then(response => {
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to add supplier order.', 500));
        });
}


const updatesupOrder = (req, res, next) => {
    const { supOrdId, supName, type, quantity, supID, matID, gemID,description, status} = req.body;
    supOrder.updateMany({ supOrdId: supOrdId}, { 
        $set: { 
            supName: supName,
            type: type,
            quantity: quantity,
            supID: supID,
            matID: matID,
            gemID: gemID,
            description: description,
            status: status
        }
    })
    .then(response => {
        res.json({ response })
    })
    .catch(error => {
        next(new AppError('Failed to update supplier order.', 500));
    });
}


const deletesupOrder = (req, res, next) => {
    const supOrdId =req.body.supOrdId;
    supOrder.deleteOne({ supOrdId: supOrdId})
        .then(response => {
            res.json({ response })
        })
        .catch(error => {
            next(new AppError('Failed to delete supplier order.', 500));
        });
}


exports.getOrders = getOrders;
exports.addsupOrder = addsupOrder;
exports.updatesupOrder = updatesupOrder;
exports.deletesupOrder = deletesupOrder;