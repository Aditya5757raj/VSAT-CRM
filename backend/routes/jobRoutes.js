const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { registerComplaint,getCustomerJobs } = require("../services/jobOperations");
const {getSingleProduct}=require("../services/productOperations");
const {getProductCategoryCode} = require("../services/codeGenration");


router.post("/registerComplaint", async (req, res) => {
  console.log("🔐 Authenticating request...");

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.warn("❌ No token provided");
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  let customer_id;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    customer_id = decoded.id;
    console.log("✅ Token verified. Customer ID:", customer_id);
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token." });
  }

  const {
    callType,
    fullName,
    mobile,
    houseNo,
    street,
    landmark,
    pin,
    locality,
    productType,
    city,
    state, // This is the state code
    availableDate,
    preferredTime,
    comments,
    priority,
    registrationDate
  } = req.body;

  console.log("📥 Extracted request body:", req.body);

  // Input validation
  if (!fullName || !mobile || !pin || !locality || !callType || !state || !priority || !registrationDate || !houseNo || !street || !city) {
    console.warn("❌ Missing required fields");
    return res.status(400).json({ error: "All required fields must be provided" });
  }

  if (mobile.length !== 10) {
    console.warn("❌ Invalid mobile number:", mobile);
    return res.status(400).json({ error: "Invalid mobile number length" });
  }

  const address = `${houseNo}, ${street}, ${landmark || ""}, ${locality}, ${city}, ${state}, ${pin}`;
  console.log("🏠 Constructed full address:", address);

  console.log("📊 Product type received:", productType);
  const categoryCode = getProductCategoryCode(productType);
  console.log("🔢 Derived Category Code:", categoryCode);

  // Job ID generation
  const regDate = new Date(registrationDate);
  if (isNaN(regDate)) {
    console.warn("❌ Invalid registrationDate format:", registrationDate);
    return res.status(400).json({ error: "Invalid registrationDate format" });
  }

  const YY = regDate.getFullYear().toString().slice(-2);
  const MM = (regDate.getMonth() + 1).toString().padStart(2, "0");
  const jobIdPrefix = `DLST${state}${categoryCode}${YY}${MM}`;
  console.log("🧩 Job ID Prefix:", jobIdPrefix);

  try {
    const [rows] = await db.execute(
      `SELECT job_id FROM jobs WHERE job_id LIKE ? ORDER BY job_id DESC LIMIT 1`,
      [`${jobIdPrefix}%`]
    );

    let sequenceNumber = 1;
    if (rows.length > 0) {
      const lastSequenceStr = rows[0].job_id.slice(-6);
      sequenceNumber = parseInt(lastSequenceStr, 10) + 1;
      console.log("🔁 Last sequence found:", lastSequenceStr);
    } else {
      console.log("ℹ️ No previous jobs found for this prefix. Starting with sequence 000001");
    }

    const job_id = jobIdPrefix + sequenceNumber.toString().padStart(6, "0");
    console.log("✅ Generated Job ID:", job_id);

    const response = await registerComplaint({
      customer_id,
      job_id,
      call_type: callType,
      call_priority: priority,
      full_name: fullName,
      mobile_number: mobile,
      house_no: houseNo,
      street,
      landmark,
      pin_code: pin,
      locality,
      product_type: productType,
      city,
      state_code: state,
      available_date: availableDate,
      preferred_time: preferredTime,
      comments,
      full_address: address,
    });

    console.log("✅ Complaint registered successfully with job ID:", job_id);
    return res.status(201).json(response);
  } catch (error) {
    console.error("❌ Error during complaint registration:", error);
    return res.status(500).json({ error: "Failed to register complaint" });
  }
});



router.post('/fetchcustomerJobs', async (req, res) => {
  const authHeader = req.headers['authorization'];
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
  const {customerName,mobile,pincode}=req.body;
  console.log(customerName+mobile+pincode);
  try {
    const jobs = await getCustomerJobs(mobile,pincode);
    return res.status(200).json({ jobs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
