const supOrder = require('../models/supOrder');
const AppError = require('../utils/AppError');
const sanitize = require("mongo-sanitize");

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
    const sanitizedBody = sanitize(req.body);
    const { supOrdId, supName, type, quantity, supID, matID, gemID, description, status } = sanitizedBody;

    // Validate required fields
    if (!supOrdId || !supName || !type || !quantity || !supID) {
        return next(new AppError('Order ID, supplier name, type, quantity, and supplier ID are required.', 400));
    }

    // Validate quantity is a positive number
    if (typeof quantity !== 'number' || quantity <= 0) {
        return next(new AppError('Quantity must be a positive number.', 400));
    }

    // Validate type is one of expected values
    const validTypes = ['material', 'gem', 'other'];
    if (!validTypes.includes(type)) {
        return next(new AppError('Type must be one of: material, gem, other.', 400));
    }

    // Validate relevant IDs based on type
    if (type === 'material' && !matID) {
        return next(new AppError('Material ID is required for material type orders.', 400));
    }

    if (type === 'gem' && !gemID) {
        return next(new AppError('Gem ID is required for gem type orders.', 400));
    }

    const newSupOrder = new supOrder({
        supOrdId: supOrdId,
        supName: supName,
        type: type,
        quantity: quantity,
        supID: supID,
        matID: matID,
        gemID: gemID,
        description: description,
        status: status,
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
    const sanitizedBody = sanitize(req.body);
    const { supOrdId, supName, type, quantity, supID, matID, gemID, description, status } = sanitizedBody;

    // Validate required ID field
    if (!supOrdId) {
        return next(new AppError('Supplier order ID is required.', 400));
    }

    // Validate quantity if provided
    if (quantity && (typeof quantity !== 'number' || quantity <= 0)) {
        return next(new AppError('Quantity must be a positive number.', 400));
    }

    // Validate type if provided
    if (type) {
        const validTypes = ['material', 'gem', 'other'];
        if (!validTypes.includes(type)) {
            return next(new AppError('Type must be one of: material, gem, other.', 400));
        }
    }

    supOrder.updateOne({ supOrdId: supOrdId }, { 
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
        if (response.matchedCount === 0) {
            return next(new AppError('Supplier order not found.', 404));
        }
        res.json({ response })
    })
    .catch(error => {
        next(new AppError('Failed to update supplier order.', 500));
    });
}

const deletesupOrder = (req, res, next) => {
    const sanitizedBody = sanitize(req.body);
    const { supOrdId } = sanitizedBody;

    // Validate required ID field
    if (!supOrdId) {
        return next(new AppError('Supplier order ID is required.', 400));
    }

    supOrder.deleteOne({ supOrdId: supOrdId })
        .then(response => {
            if (response.deletedCount === 0) {
                return next(new AppError('Supplier order not found.', 404));
            }
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