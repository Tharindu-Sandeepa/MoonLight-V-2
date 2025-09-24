const mongoose = require("mongoose");
const AppError = require('../utils/AppError');
require("../models/Jewllery");
const Jewllery = mongoose.model("Jewllery");
const fs = require("fs");
const path = require("path");
const imagesPath = path.join(__dirname, "../../Frontend/src/images/");
const sanitize = require("mongo-sanitize");

exports.uploadImage = async (req, res, next) => {
  const sanitizedBody = sanitize(req.body);
  const { name, type, price, description } = sanitizedBody;
  
  if (!req.file) {
    return next(new AppError("No image uploaded", 400));
  }

  // Validate required fields
  if (!name || !type || !price || !description) {
    return next(new AppError("All fields are required", 400));
  }

  // Validate price is a positive number
  if (typeof price !== 'number' || price <= 0) {
    return next(new AppError("Price must be a positive number", 400));
  }

  // Validate file type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return next(new AppError("Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed", 400));
  }

  const imageName = req.file.filename;

  try {
    await Jewllery.create({
      image: imageName,
      name: name,
      type: type,
      price: price,
      description: description
    });
    res.json({ status: "ok" });
  } catch (error) {
    next(new AppError("Failed to upload image", 500));
  }
};

exports.getImages = async (req, res, next) => {
  try {
    const data = await Jewllery.find({});
    res.send({ status: "ok", data: data });
  } catch (error) {
    next(new AppError("Failed to fetch images", 500));
  }
};

exports.deleteImage = async (req, res, next) => {
  const sanitizedParams = sanitize(req.params);
  const { id } = sanitizedParams;

  // Validate MongoDB ObjectId
  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError("Invalid item ID format", 400));
  }

  try {
    const existingJewellery = await Jewllery.findById(id);
    if (!existingJewellery) {
      return next(new AppError("Item not found", 404));
    }
    
    const imagePath = path.join(imagesPath, existingJewellery.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    await Jewllery.findByIdAndDelete(id);
    res.json({ status: "ok" });
  } catch (error) {
    next(new AppError("Failed to delete image", 500));
  }
};

exports.updateImage = async (req, res, next) => {
  const sanitizedBody = sanitize(req.body);
  const sanitizedParams = sanitize(req.params);
  
  const { name, type, price, description } = sanitizedBody;
  const { id } = sanitizedParams;

  // Validate MongoDB ObjectId
  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError("Invalid item ID format", 400));
  }

  // Validate price if provided
  if (price && (typeof price !== 'number' || price <= 0)) {
    return next(new AppError("Price must be a positive number", 400));
  }

  // Validate file type if new image is uploaded
  if (req.file) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return next(new AppError("Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed", 400));
    }
  }

  try {
    const existingJewellery = await Jewllery.findById(id);
    if (!existingJewellery) {
      return next(new AppError("Item not found", 404));
    }

    if (req.file) {
      const oldImagePath = path.join(imagesPath, existingJewellery.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      existingJewellery.image = req.file.filename;
    }

    existingJewellery.name = name || existingJewellery.name;
    existingJewellery.type = type || existingJewellery.type;
    existingJewellery.price = price || existingJewellery.price;
    existingJewellery.description = description || existingJewellery.description;

    await existingJewellery.save();
    res.json({ status: "ok" });
  } catch (error) {
    next(new AppError("Failed to update image", 500));
  }
};

exports.getItem = async (req, res, next) => {
  const sanitizedParams = sanitize(req.params);
  const { id } = sanitizedParams;

  // Validate MongoDB ObjectId
  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError("Invalid item ID format", 400));
  }

  try {
    const item = await Jewllery.findById(id);
    if (!item) {
      return next(new AppError("Item not found", 404));
    }
    res.json({ status: "ok", data: item });
  } catch (error) {
    next(new AppError("Failed to fetch item", 500));
  }
};