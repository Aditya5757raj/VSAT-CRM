const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const {addProduct,getCustomerProducts}=require("../services/productOperations");
router.post("/addProduct", async (req, res) => {
  // Extract and validate token
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  let customer_id;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    customer_id = decoded.id;
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }

  const user_id=customer_id;
  // Destructure product data from request body
  const {
    productName,
    productType,
    modelNo,
    serial,
    manufacturer,
    purchaseDate,
    warrantyExpiry,
    notes
  } = req.body;

  // Basic validation for required fields
  if (!productName || !productType || !modelNo || !manufacturer || !purchaseDate || !warrantyExpiry) {
    return res.status(400).json({ error: "All required fields must be provided." });
  }

  try {
    // Add product with customer ID from token
    const response = await addProduct({
      productName,
      productType,
      modelNo,
      serial,
      manufacturer,
      purchaseDate,
      warrantyExpiry,
      notes: notes || "", 
      user_id
    });

    return res.status(201).json(response);
  } catch (err) {
    console.error("❌ Error adding product:", err);
    const statusCode = err.message.includes("exists") ? 400 : 500;
    return res.status(statusCode).json({ error: err.message });
  }
});

router.get('/fetchcustomerProducts', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  let customer_id;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    customer_id = decoded.id;
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }

  try {
    const products = await getCustomerProducts(customer_id);
    return res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
module.exports = router;
