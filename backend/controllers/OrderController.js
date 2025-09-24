const Orders = require("../models/Order");
const sanitize = require("mongo-sanitize");
const mongoose = require("mongoose");

// getOrders (unchanged, no direct input)
const getOrders = (req, res, next) => {
  Orders.find()
    .then((response) => {
      res.json({ response });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
};

// addOrder: Sanitize and validate
const addOrder = (req, res, next) => {
  const sanitizedBody = sanitize(req.body);
  const { userID, orderID, items, total, amount, date, slip, status } =
    sanitizedBody;

  // Validate inputs
  if (!userID || typeof total !== "number" || !orderID || !date) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const order = new Orders({
    userID,
    orderID,
    items,
    total,
    amount,
    date,
    slip,
    status,
  });

  order
    .save()
    .then((response) => {
      res.json({ response });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
};

// updateOrder: Validate ObjectId and sanitize
const updateOrder = async (req, res, next) => {
  const sanitizedBody = sanitize(req.body);
  const { id, userID, orderID, items, total, amount, date, slip, status } =
    sanitizedBody;

  // Validate ObjectId
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    const response = await Orders.updateOne(
      { _id: id },
      {
        $set: {
          userID,
          orderID,
          items,
          total,
          amount,
          date,
          slip,
          status,
        },
      }
    );
    if (response.matchedCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// deleteOrder: Validate ObjectId and sanitize
const deleteOrder = async (req, res, next) => {
  const sanitizedBody = sanitize(req.body);
  const { id } = sanitizedBody;

  // Validate ObjectId
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    const response = await Orders.deleteOne({ _id: id });
    if (response.deletedCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrders = getOrders;
exports.addOrder = addOrder;
exports.updateOrder = updateOrder;
exports.deleteOrder = deleteOrder;
