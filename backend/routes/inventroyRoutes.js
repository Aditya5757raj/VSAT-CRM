// routes/partRequestRoutes.js
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { sequelize } = require("../models"); // ✅ import sequelize instance
const PartRequest = require("../models/PartRequest");

// 🔹 Helper function to generate PO Number (transaction-safe)
async function generatePoNumber(transaction) {
  const today = new Date();
  const yy = String(today.getFullYear()).slice(-2);
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const datePrefix = `${yy}${mm}${dd}`;

  // Find the last PO number for today (lock row for update)
  const lastRequest = await PartRequest.findOne({
    where: {
      po_number: {
        [Op.like]: `PO${datePrefix}%`,
      },
    },
    order: [["po_number", "DESC"]],
    transaction,
    lock: transaction.LOCK.UPDATE, // ✅ prevents race condition
  });

  let next = 1;
  if (lastRequest && lastRequest.po_number) {
    const lastNum = parseInt(lastRequest.po_number.slice(-5), 10);
    if (!isNaN(lastNum)) {
      next = lastNum + 1;
    }
  }

  return `PO${datePrefix}${String(next).padStart(5, "0")}`;
}

// ✅ GET all part requests
router.get("/getparts", async (req, res) => {
  try {
    const requests = await PartRequest.findAll();
    res.json(requests);
  } catch (error) {
    console.error("Error fetching part requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ POST new part request
router.post("/addparts", async (req, res) => {
  const { model_number, part_code, requested_quantity, complaint_id } = req.body;

  if (!model_number || !part_code || !requested_quantity || !complaint_id) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let attempt = 0;
  while (attempt < 3) {
    attempt++;
    const t = await sequelize.transaction();
    try {
      // Generate PO number inside transaction
      const po_number = await generatePoNumber(t);

      // Insert part request
      const newRequest = await PartRequest.create(
        {
          model_number,
          part_code,
          requested_quantity,
          po_number,
          complaint_id,
        },
        { transaction: t }
      );

      await t.commit();
      return res.status(201).json(newRequest);
    } catch (error) {
      await t.rollback();

      if (error.name === "SequelizeUniqueConstraintError" && attempt < 3) {
        console.warn("⚠️ Duplicate PO detected, retrying...");
        continue; // retry loop
      }

      console.error("❌ Error creating part request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

module.exports = router;
