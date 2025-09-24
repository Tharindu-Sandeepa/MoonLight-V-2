const mongoose = require("mongoose");
require("../models/Jewllery");
const Jewllery = mongoose.model("Jewllery");
const fs = require("fs");
const path = require("path");
const imagesPath = path.join(__dirname, "../../Frontend/src/images/");

exports.uploadImage = async (req, res) => {
  const { name, type, price, description } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
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
    console.error("Error uploading image:", error.message);
    res.status(500).json({ error: "Failed to upload image", message: error.message });
  }
};

exports.getImages = async (req, res) => {
  try {
    const data = await Jewllery.find({});
    res.send({ status: "ok", data: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch images", message: error.message });
  }
};

exports.deleteImage = async (req, res) => {
  const { id } = req.params;
  try {
    const existingJewellery = await Jewllery.findById(id);
    if (!existingJewellery) {
      return res.status(404).json({ error: "Item not found" });
    }
    const imagePath = path.join(imagesPath, existingJewellery.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    await Jewllery.findByIdAndDelete(id);
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Failed to delete image", message: error.message });
  }
};

exports.updateImage = async (req, res) => {
  const { name, type, price, description } = req.body;
  const { id } = req.params;

  try {
    const existingJewellery = await Jewllery.findById(id);
    if (!existingJewellery) {
      return res.status(404).json({ error: "Item not found" });
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
    console.error("Error updating image:", error);
    res.status(500).json({ error: "Failed to update image", message: error.message });
  }
};

exports.getItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Jewllery.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ status: "ok", data: item });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch item", message: error.message });
  }
};