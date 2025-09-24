const Orders = require('../models/Order');
const AppError = require('../utils/AppError');


//getOrders
const getOrders = (req,res,next)=>{
    Orders.find()
    .then(response=>{
        res.json({response})
    })
    .catch(error=>{
        next(new AppError('Failed to retrieve orders.', 500));
    });
};

// addOrder
const addOrder = (req, res, next) => {
    const { userID, orderID, items, total, amount, date, slip, status } = req.body;

    const order = new Orders({
    
        userID: userID,
        orderID: orderID,
        items: items,
        total: total,
        amount: amount,
        date: date,
        slip: slip,
        status: status
    });

    order.save()
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            next(new AppError('Failed to add new order.', 500));
        });
};

const updateOrder = async (req, res, next) => {
    const { id, userID, orderID, items, total, amount, date, slip, status } = req.body;

        Orders.updateOne(
            { _id: id },
            {
                $set: {
                    userID: userID,
                    orderID: orderID,
                    items: items,
                    total: total,
                    amount: amount,
                    date: date,
                    slip: slip,
                    status: status
                },
            }
        )
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            next(new AppError('Failed to update order.', 500));
        });

};

// delete order
const deleteOrder = (req, res, next) => {
    const { id } = req.body; // Retrieve _id from the request body

    Orders.deleteOne({ _id: id }) // Use _id to delete the user
        .then(response => {
            res.json({ response });
        })
        .catch(error => {
            next(new AppError('Failed to delete order.', 500));
        });
};

exports.getOrders=getOrders;
exports.addOrder =addOrder;
exports.updateOrder=updateOrder;
exports.deleteOrder=deleteOrder;