const mongoose = require("mongoose");
require("../models/GemimageDetails");
const Images = mongoose.model("ImageDetails");
const fs = require("fs");
const path = require("path");
const imagesPath = path.join(__dirname, "../../src/images/"); // Updated to match jewelry routes

exports.uploadImage = async (req, res) => {
  const { name, type, price, description } = req.body;

  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded or invalid file type" });
  }

  const imageName = req.file.filename;

  try {
    // Create a new document with image and additional fields
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
    res.status(500).json({ error: "Failed to upload image", message: error.message });
  }
};

exports.getImages = async (req, res) => {
  try {
    const data = await Images.find({});
    res.send({ status: "ok", data: data });
  } catch (error) {
    console.error("Error fetching gem images:", error.message);
    res.status(500).json({ error: "Failed to fetch images", message: error.message });
  }
};

exports.deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the existing document to determine which image file to delete
    const existingGem = await Images.findById(id);
    if (!existingGem) {
      return res.status(404).json({ error: "Gem not found" });
    }

    // Delete the image file associated with the entry
    const imagePath = path.join(imagesPath, existingGem.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete the entry from the database
    await Images.findByIdAndDelete(id);

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error deleting gem image:", error.message);
    res.status(500).json({ error: "Failed to delete image", message: error.message });
  }
};

exports.updateImage = async (req, res) => {
  const { name, type, price, description } = req.body;
  const { id } = req.params;

  try {
    // Find the existing document
    const existingGem = await Images.findById(id);
    if (!existingGem) {
      return res.status(404).json({ error: "Gem not found" });
    }

    // If a new image was uploaded, delete the old one and update the image field
    if (req.file) {
      const oldImagePath = path.join(imagesPath, existingGem.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      existingGem.image = req.file.filename;
    }

    // Update other fields
    existingGem.name = name || existingGem.name;
    existingGem.type = type || existingGem.type;
    existingGem.price = price || existingGem.price;
    existingGem.description = description || existingGem.description;

    // Save the updated document
    await existingGem.save();

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error updating gem image:", error.message);
    res.status(500).json({ error: "Failed to update image", message: error.message });
  }
};

exports.getItem = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Images.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Gem not found" });
    }
    res.json({ status: "ok", data: item });
  } catch (error) {
    console.error("Error fetching gem item:", error.message);
    res.status(500).json({ error: "Failed to fetch item", message: error.message });
  }
};