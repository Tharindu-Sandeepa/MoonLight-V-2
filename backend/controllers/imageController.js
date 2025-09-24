const mongoose = require("mongoose");
const AppError = require('../utils/AppError');
const fs = require("fs");
const path = require("path");

require("../models/GemimageDetails");
const Images = mongoose.model("ImageDetails");

const imagesPath = path.join(__dirname, "../../src/images/");

exports.uploadImage = async (req, res, next) => {
  const { name, type, price, description } = req.body;

  if (!req.file) {
    return next(new AppError("No image uploaded or invalid file type", 400));
  }

  const imageName = req.file.filename;

  try {
    await Images.create({
      image: imageName,
      name: name,
      type: type,
      price: price,
      description: description
    });

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error uploading gem image:", error.message);
    next(new AppError("Failed to upload image", 500));
  }
};

exports.getImages = async (req, res, next) => {
  try {
    const data = await Images.find({});
    res.send({ status: "ok", data: data });
  } catch (error) {
    console.error("Error fetching gem images:", error.message);
    next(new AppError("Failed to fetch images", 500));
  }
};

exports.deleteImage = async (req, res, next) => {
  const { id } = req.params;

  try {
    const existingGem = await Images.findById(id);
    if (!existingGem) {
      return next(new AppError("Gem not found", 404));
    }

    const imagePath = path.join(imagesPath, existingGem.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Images.findByIdAndDelete(id);

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error deleting gem image:", error.message);
    next(new AppError("Failed to delete image", 500));
  }
};

exports.updateImage = async (req, res, next) => {
  const { name, type, price, description } = req.body;
  const { id } = req.params;

  try {
    const existingGem = await Images.findById(id);
    if (!existingGem) {
      return next(new AppError("Gem not found", 404));
    }

    if (req.file) {
      const oldImagePath = path.join(imagesPath, existingGem.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      existingGem.image = req.file.filename;
    }

    existingGem.name = name || existingGem.name;
    existingGem.type = type || existingGem.type;
    existingGem.price = price || existingGem.price;
    existingGem.description = description || existingGem.description;

    await existingGem.save();

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error updating gem image:", error.message);
    next(new AppError("Failed to update image", 500));
  }
};

exports.getItem = async (req, res, next) => {
  const { id } = req.params;

  try {
    const item = await Images.findById(id);
    if (!item) {
      return next(new AppError("Gem not found", 404));
    }
    res.json({ status: "ok", data: item });
  } catch (error) {
    console.error("Error fetching gem item:", error.message);
    next(new AppError("Failed to fetch item", 500));
  }
};
