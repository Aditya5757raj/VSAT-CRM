const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { encrypt } = require("../utils/cryptoUtils");
const { Complaint} = require("../models");
const { Op } = require("sequelize");
const {
  registerComplaint,
  getComplaintDetails
} = require("../services/jobOperations");

// Route: Register Complaint
router.post("/registerComplaint", async (req, res) => {
  const {
    root_request_id, customer_request_id, ecom_order_id, issue_type, customer_name, mobile_number, city, pincode, product_type,
    product_name, symptoms, model_no, serial_number, brand, date_of_purchase,
    warranty, booking_date, booking_time,estimated_product_delivery_date,
    flat_no, street_area, landmark, state, locality,call_priority,
  } = req.body;

  const finalCallType = issue_type?.toLowerCase() === 'repair' ? 'RE' : 'IN';
  console.log(req.body);
  // ✅ Validation
  if (!customer_name || !mobile_number || !pincode || !locality ||
      !state || !call_priority || !date_of_purchase || !flat_no || !street_area || !city) {
    return res.status(400).json({ error: "All required fields must be provided." });
  }

  if (!/^\d{10}$/.test(mobile_number)) {
    return res.status(400).json({ error: "Invalid mobile number length." });
  }

  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);

  try {
    // ✅ Get the most recent complaint (regardless of call type or date)
    const latestComplaint = await Complaint.findOne({
      order: [['req_creation_date', 'DESC']]
    });

    let newSeqNum = 1;

    if (latestComplaint && latestComplaint.complaint_id) {
      const lastId = latestComplaint.complaint_id;
      const lastSeq = parseInt(lastId.slice(-6)); // Get '000123' → 123
      if (!isNaN(lastSeq)) {
        newSeqNum = lastSeq + 1;
      }
    }

    const seqStr = String(newSeqNum).padStart(6, '0');
    const complaint_id = `${finalCallType}${day}${month}${year}${seqStr}`;

    console.log("📋 Generated Complaint ID:", complaint_id);

    // ✅ Build full address
    const address = `${flat_no}, ${street_area}, ${landmark || ''}, ${locality}, ${city}, ${state}, ${pincode}`;

    // ✅ Save complaint
    const isregister = await registerComplaint({
      complaint_id,
      request_type: "FIRST_TIME",
      root_request_id,
      issue_type,
      customer_request_id,
      ecom_order_id,
      product_type,
      product_name,
      symptoms,
      warranty,
      model_no,
      serial_number,
      brand,
      booking_date,
      booking_time,
      customer_name,
      date_of_purchase,
      city,
      call_priority,
      job_status: "Unassigned",
      pincode,
      mobile_number,
      address,
      estimated_product_delivery_date,
      req_creation_date: now
    });

    return res.status(201).json(isregister);

  } catch (error) {
    console.error("❌ Complaint registration failed:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route: Get Complaint Details by Customer Info
router.post('/complaint-details', async (req, res) => {
  const { full_name, mobile_number, pincode } = req.body;

  if (!full_name || !mobile_number || !pincode) {
    return res.status(400).json({ error: 'Full name, mobile number, and pincode are required.' });
  }

  try {
    const complaints = await Complaint.findAll({
      where: {
        mobile_number,
        pincode
      }
    });

    if (complaints.length === 0) {
      return res.status(404).json({ error: 'No complaints found for this customer.' });
    }

    const complaintDetails = complaints.map((c) => ({
      complaint_id: c.complaint_id,
      customer_name: c.customer_name,
      mobile_number: c.mobile_number,
      city: c.city,
      pincode: c.pincode,
      address: c.address,
      product_type: c.product_type,
      product_name: c.product_name,
      model_no: c.model_no,
      serial_number: c.serial_number,
      brand: c.brand,
      warranty: c.warranty,
      date_of_purchase: c.date_of_purchase,
      issue_type: c.issue_type,
      symptoms: c.symptoms,
      call_type: c.call_type || "IN/RE",
      call_priority: c.call_priority || "Urgent",
      booking_date: c.booking_date,
      booking_time: c.booking_time,
      job_status: c.job_status,
      estimated_product_delivery_date: c.estimated_product_delivery_date,
      req_creation_date: c.req_creation_date
    }));

    return res.status(200).json({
      message: "Complaint details fetched successfully.",
      total_complaints: complaints.length,
      complaints: complaintDetails
    });

  } catch (error) {
    console.error('❌ Error in /complaint-details route:', error.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
