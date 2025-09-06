const express = require('express');
const router = express.Router();
const getMulterUpload = require('../services/multer');
const upload = getMulterUpload();
const { sequelize, User,ServiceCenter, OperatingPincode,CcAgent,Product,Brand } = require('../models');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { registerServiceCenter } = require("../services/serviceCenter");
const { verifyToken } = require("../services/verifyToken")

router.post("/products",async (req, res) => {
  try {
    const { productType, productName } = req.body;
    const userId = verifyToken(req);
    console.log('🔐 Token verified. Extracted userId:', userId);

    if (!userId) {
      console.warn('⚠️ Missing or invalid userId from token');
      return res.status(400).json({ message: "Missing userId" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      console.warn('❌ User not found in DB for userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('👤 Authenticated User:', {
      user_id: user.user_id,
      email: user.email,
      role: user.role
    });

    const role = user.role.toLowerCase();
    if (!productType || !productName) {
      return res.status(400).json({ message: "Product type and name are required" });
    }

    if (role === 'admin') {
        
    const newProduct = new Product({
      type: productType,
      name: productName,
      createdBy: req.user.id
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
}
catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// POST /addproduct/brands
router.post("/brands",async (req, res) => {
  try {
    const { brandName } = req.body;
    const userId = verifyToken(req);
    console.log('🔐 Token verified. Extracted userId:', userId);
    const user = await User.findByPk(userId);
    if (!user) {
      console.warn('❌ User not found in DB for userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('👤 Authenticated User:', {
      user_id: user.user_id,
      email: user.email,
      role: user.role
    });

    const role = user.role.toLowerCase();
    if (role === 'admin') {
         if (!brandName) {
      return res.status(400).json({ message: "Brand name is required" });
    }

    const newBrand = new Brand({
      name: brandName,
      createdBy: req.user.id
    });

    await newBrand.save();
    res.status(201).json({ message: "Brand added successfully", brand: newBrand });
    } else {
    res.status(403).json({ message: "Forbidden" });
    }   
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/products", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Brand, as: 'brand', attributes: ['id', 'name'] }]
    });
    res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /addproduct/brands → Fetch all brands
router.get("/brands", authenticateToken, async (req, res) => {
  try {
    const brands = await Brand.findAll({
      include: [{ model: Product, as: 'products', attributes: ['id', 'name', 'type'] }]
    });
    res.status(200).json({ brands });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;