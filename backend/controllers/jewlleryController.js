const mongoose = require("mongoose");
const AppError = require('../utils/AppError');
require("../models/Jewllery");
const Jewllery = mongoose.model("Jewllery");
const fs = require("fs");
const path = require("path");
const imagesPath = path.join(__dirname, "../../Frontend/src/images/");

exports.uploadImage = async (req, res, next) => {
  const { name, type, price, description } = req.body;
  if (!req.file) {
    return next(new AppError("No image uploaded", 400));
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
  const { id } = req.params;
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
  const { name, type, price, description } = req.body;
  const { id } = req.params;

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
  const { id } = req.params;
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