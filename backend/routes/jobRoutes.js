const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { encrypt } = require("../utils/cryptoUtils");
const { Complaint, Customer } = require("../models");
const {
  registerComplaint,
  registerCustomer,
  registerProduct,
  getComplaintDetails
} = require("../services/jobOperations");

// Route: Register Complaint
router.post("/registerComplaint", async (req, res) => {
  console.log("🔐 Authenticating request...");

  // const authHeader = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];

  // if (!token) {
  //   return res.status(401).json({ message: "Access Denied. No token provided." });
  // }

  // let user_id;
  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //   user_id = decoded.id;
  //   console.log("✅ Token verified. Customer ID:", user_id);
  // } catch (err) {
  //   return res.status(403).json({ message: "Invalid or expired token." });
  // }

  const {
    call_type, pincode, symptoms, customer_available_at, preferred_time_slot,
    call_priority, full_name, mobile_number, flat_no, street_area, landmark,
    locality, city, state, product_type, product_name, model_number,
    serial_number, brand, date_of_purchase, warranty
  } = req.body;

  // ✅ Validation
  if (!full_name || !mobile_number || !pincode || !locality || !call_type ||
    !state || !call_priority || !date_of_purchase || !flat_no || !street_area || !city) {
    return res.status(400).json({ error: "All required fields must be provided." });
  }

  if (!/^\d{10}$/.test(mobile_number)) {
    return res.status(400).json({ error: "Invalid mobile number length." });
  }

  // ✅ ID Generation
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const randomSeq = Math.floor(Math.random() * 900000 + 100000);
  const complaint_id = `${call_type}-${day}-${month}-${randomSeq}`;
  console.log(complaint_id)

  const pinPart = pincode.slice(0, 3);                  // 3 characters
  const flatPart = flat_no.slice(0, 3).toUpperCase();   // 3 characters max
  const mobilePart = mobile_number.slice(-4);           // 4 characters
  const customer_id = `${pinPart}${flatPart}${mobilePart}`;
  console.log(customer_id);


  const custPart = customer_id.slice(0, 3).toUpperCase();
  const typePart = product_type.slice(-3).toUpperCase();
  const modelPart = model_number.slice(0, 4).toUpperCase();
  const product_id = `${custPart}${typePart}${modelPart}`;
  console.log(product_id);
  try {

    await registerProduct({
      product_id,
      product_type,
      product_name,
      model_number,
      serial_number,
      brand,
      date_of_purchase,
      warranty
    });
    // Register Customer if not already
    await registerCustomer({
      customer_id,
      full_name,
      mobile_number,
      flat_no,
      street_area,
      landmark,
      pincode,
      locality,
      city,
      state
    });
    // Register Complaint
    const isregister = await registerComplaint({
      complaint_id,
      customer_id,
      product_id,
      call_type,
      pincode,
      symptoms,
      customer_available_at,
      preferred_time_slot,
      call_priority
    });
    // Register Product if not already
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
    const encName = encrypt(full_name);
    const encMobile = encrypt(mobile_number);
    const encPincode = encrypt(pincode);

    // Find customer
    const customer = await Customer.findOne({
      where: {
        mobile_number: encMobile,
        pincode: encPincode
      }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    // Get all complaints for this customer
    const complaints = await Complaint.findAll({
      where: { customer_id: customer.customer_id }
      // Add ordering here if needed based on a valid column
    });

    const totalComplaints = complaints.length;
    console.log(`Total complaints for customer ${customer.customer_id}: ${totalComplaints}`);

    if (complaints.length === 0) {
      return res.status(404).json({ error: 'No complaints found for this customer.' });
    }

    // Fetch full details for each complaint
    const complaintDetails = await Promise.all(
      complaints.map(c => getComplaintDetails(c.complaint_id))
    );

    return res.status(200).json({
      message: "All complaint details fetched successfully.",
      total_complaints: totalComplaints,
      complaints: complaintDetails.map(detail => ({
        complaint_id: detail.complaint_id,
        customer: detail.Customer,
        product: detail.Product,
        complaint_info: {
          call_type: detail.call_type,
          pincode: detail.pincode,
          symptoms: detail.symptoms,
          customer_available_at: detail.customer_available_at,
          preferred_time_slot: detail.preferred_time_slot,
          call_priority: detail.call_priority,
          status: detail.status,
          createdAt: detail.createdAt
        }
      }))
    });

  } catch (error) {
    console.error('❌ Error in /complaint-details route:', error.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


module.exports = router;
