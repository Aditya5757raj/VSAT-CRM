// routes/partRequestRoutes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const PartRequest = require('../models/PartRequest');

// 🔹 Helper function to generate PO Number
async function generatePoNumber() {
  const today = new Date();
  const yy = String(today.getFullYear()).slice(-2);
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  const datePrefix = `${yy}${mm}${dd}`;

  // Find the last PO number for today
  const lastRequest = await PartRequest.findOne({
    where: {
      po_number: {
        [Op.like]: `PO${datePrefix}%`
      }
    },
    order: [['createdAt', 'DESC']]
  });

  let next = 1;
  if (lastRequest && lastRequest.po_number) {
    const lastNum = parseInt(lastRequest.po_number.slice(-5), 10);
    if (!isNaN(lastNum)) {
      next = lastNum + 1;
    }
  }

  return `PO${datePrefix}${String(next).padStart(5, '0')}`;
}

// ✅ GET all part requests
router.get('/getparts', async (req, res) => {
  try {
    const requests = await PartRequest.findAll();
    res.json(requests);
  } catch (error) {
    console.error("Error fetching part requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ POST new part request
router.post('/addparts', async (req, res) => {
  try {
    const { model_number, part_code, requested_quantity, complaint_id } = req.body;

    if (!model_number || !part_code || !requested_quantity || !complaint_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Generate PO number
    const po_number = await generatePoNumber();

    const newRequest = await PartRequest.create({
      model_number,
      part_code,
      requested_quantity,
      po_number,
      complaint_id
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating part request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
