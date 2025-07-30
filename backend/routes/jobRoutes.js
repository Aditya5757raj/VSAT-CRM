const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { encrypt } = require("../utils/cryptoUtils");
const { Complaint,OperatingPincode,ServiceCenter} = require("../models");
const { Op } = require("sequelize");
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const getMulterUpload = require('../services/multer');
const upload = getMulterUpload('uploads/callRegistration_information');
const {
  registerComplaint,
  getComplaintDetails
} = require("../services/jobOperations");



function parseDate(dateStr, fieldName = '') {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split("-");
  if (!day || !month || !year) {
    console.warn(`⚠️ Invalid date format for ${fieldName}: ${dateStr}`);
    return null;
  }
  const isoDate = new Date(`${year}-${month}-${day}`);
  if (isNaN(isoDate.getTime())) {
    console.warn(`⚠️ Invalid JS date object for ${fieldName}: ${dateStr}`);
    return null;
  }
  return isoDate;
}

// Route: Register Complaint
router.post("/registerComplaint", async (req, res) => {
  const {
    root_request_id, customer_request_id, ecom_order_id, issue_type, customer_name, mobile_number, city, pincode, product_type,
    product_name, symptoms, model_no, serial_number, brand, date_of_purchase,
    warranty, booking_date, booking_time,estimated_product_delivery_date,
    flat_no, street_area, landmark, state, locality,call_priority,service_partner
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
      service_partner,
      estimated_product_delivery_date,
      req_creation_date: now
    });

    return res.status(201).json(isregister);

  } catch (error) {
    console.error("❌ Complaint registration failed:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
//csv call registraction
router.post('/upload-csv', upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No CSV file uploaded.' });
  }

  const filePath = path.join(__dirname, '..', req.file.path);
  const results = [];

  try {
    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream) {
      try {
        console.log("📄 Processing row:", row);

        // ✅ Validate required fields
        const requiredFields = [
          'full_name', 'mobile_number', 'pincode', 'locality', 'state',
          'call_priority', 'date_of_purchase', 'flat_no', 'street_area', 'city'
        ];
        const isMissing = requiredFields.some(field => !row[field]?.trim());
        if (isMissing) {
          results.push({ customer_request_id: row.customer_request_id || 'N/A', status: 'skipped', reason: 'Missing required fields' });
          continue;
        }

        // ✅ Mobile number validation
        if (!/^\d{10}$/.test(row.mobile_number)) {
          results.push({ customer_request_id: row.customer_request_id || 'N/A', status: 'skipped', reason: 'Invalid mobile number' });
          continue;
        }

        // ✅ Get service center from pincode
        const pincodeEntry = await OperatingPincode.findOne({ where: { pincode: row.pincode } });
        if (!pincodeEntry) {
          results.push({
            customer_request_id: row.customer_request_id || 'N/A',
            status: 'skipped',
            reason: `No service center found for pincode ${row.pincode}`
          });
          continue;
        }

        // ✅ Complaint ID generation
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = String(now.getFullYear()).slice(-2);
        const finalCallType = row.call_type?.toLowerCase() === 'repair' ? 'RE' : 'IN';

        const latestComplaint = await Complaint.findOne({ order: [['req_creation_date', 'DESC']] });
        let newSeqNum = 1;
        if (latestComplaint?.complaint_id) {
          const lastSeq = parseInt(latestComplaint.complaint_id.slice(-6));
          if (!isNaN(lastSeq)) newSeqNum = lastSeq + 1;
        }
        const seqStr = String(newSeqNum).padStart(6, '0');
        const complaint_id = `${finalCallType}${day}${month}${year}${seqStr}`;

        console.log("📝 Generated Complaint ID:", complaint_id);

        // ✅ Address
        const address = `${row.flat_no}, ${row.street_area}, ${row.landmark || ''}, ${row.locality}, ${row.city}, ${row.state}, ${row.pincode}`;

        // ✅ Build payload
        const payload = {
          complaint_id,
          request_type: "FIRST_TIME",
          root_request_id: row.root_request_id,
          issue_type: row.call_type,
          customer_request_id: row.customer_request_id,
          ecom_order_id: row.ecommerce_id,
          product_type: row.product_type,
          product_name: row.product_name,
          symptoms: row.symptoms,
          warranty: row.warranty,
          model_no: row.model_number,
          serial_number: row.serial_number,
          brand: row.brand,
          booking_date: parseDate(row.customer_available_at, 'customer_available_at'),
          booking_time: row.preferred_time_slot,
          customer_name: row.full_name,
          date_of_purchase:row.date_of_purchase?.trim(),
          city: row.city,
          call_priority: row.call_priority,
          job_status: "Unassigned",
          pincode: row.pincode,
          mobile_number: row.mobile_number,
          address,
          service_partner: pincodeEntry.center_id,
          estimated_product_delivery_date: parseDate(row.estimated_delivery, 'estimated_delivery'),
          req_creation_date: now
        };

        console.log("📦 Registering complaint for:", row.full_name);

        await registerComplaint(payload);
        results.push({ complaint_id, status: "success" });

      } catch (err) {
        console.error("❗ Error while processing row:", err);
        results.push({
          customer_request_id: row.customer_request_id || 'N/A',
          status: 'failed',
          error: err.message
        });
      }
    }

    fs.unlink(filePath, () => {
      console.log("🧹 Temporary file deleted:", filePath);
    });

    console.log("📊 CSV Processing Complete:", {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      failed: results.filter(r => r.status === 'failed').length,
    });

    return res.json({
      success: true,
      message: 'CSV Processed',
      summary: {
        total: results.length,
        success: results.filter(r => r.status === 'success').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        failed: results.filter(r => r.status === 'failed').length,
      },
      details: results
    });

  } catch (error) {
    console.error("🔥 CSV processing failed:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error while processing CSV." });
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
      req_creation_date: c.req_creation_date,
      service_partner:c.service_partner
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

router.get('/getPartnerByPincode', async (req, res) => {
  try {
    const { pin } = req.query;

    if (!pin) {
      return res.status(400).json({ message: "Pincode is required." });
    }

    const pincodeInfo = await OperatingPincode.findOne({
      where: { pincode: pin },
      include: {
        model: ServiceCenter,
        attributes: ['partner_name']
      }
    });

    if (!pincodeInfo || !pincodeInfo.ServiceCenter) {
      return res.status(200).json({});
    }

    res.status(200).json({ partner_name: pincodeInfo.ServiceCenter.partner_name });

  } catch (error) {
    console.error("❌ Error fetching partner by pincode:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


module.exports = router;
