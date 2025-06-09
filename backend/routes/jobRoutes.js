const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { registerComplaint,getCustomerJobs } = require("../services/jobOperations");
const {getSingleProduct}=require("../services/productOperations");
const {getProductCategoryCode} = require("../services/codeGenration");



router.post("/registerComplaint", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }
  console.log(token);
  console.log(process.env.JWT_SECRET);
  let customer_id;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    customer_id = decoded.id;
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
  //productCategory+statecode is required form frontend
  const {
    name,
    mobile,
    pin,
    locality,
    address,
    stateCode,
    callType,
    serial,
    purchaseDate,
    comments,
    priority,
    registrationDate,
  } = req.body;
  if(mobile.length < 10 || mobile.length > 10) {
  return res.status(400).json({error: "Invalid mobile number length"});
}
  console.log("Received complaint data:", {
    name,
    mobile,
    pin,
    locality,
    address,
    callType,
    serial,
    purchaseDate,
    stateCode,
    comments,
    priority,
    registrationDate,
  });
  if (
    !name ||
    !mobile ||
    !pin ||
    !locality ||
    !address ||
    !callType ||
    !serial ||
    !stateCode||
    !purchaseDate ||
    !priority ||
    !registrationDate
  ) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided" });
  }


  let categoryCode;
  try {
  const productData = await getSingleProduct(serial);

  if (!productData) {
     return res.status(400).json({ 
    error: "Product not found. Please ensure the serial number is correct and the product is registered under your account." 
  });
  }

  const productType = productData.product_type; // safe to access now
  categoryCode = getProductCategoryCode(productType);
  console.log("ProductType"+productType);
  console.log("Category Code:", categoryCode);


} catch (err) {
  console.error("❌ Error fetching product data:", err);
  return res.status(500).json({ error: err.message || "Failed to fetch product data" });
}


  // Parse registration date parts
  const regDate = new Date(registrationDate);
  if (isNaN(regDate)) {
    return res.status(400).json({ error: "Invalid registrationDate format" });
  }
  const YY = regDate.getFullYear().toString().slice(-2);
  const MM = (regDate.getMonth() + 1).toString().padStart(2, "0");

  const jobIdPrefix = `DLST${stateCode}${categoryCode}${YY}${MM}`;

  try {
    // Get last sequence
    const [rows] = await db.execute(
      `SELECT job_id FROM jobs WHERE job_id LIKE ? ORDER BY job_id DESC LIMIT 1`,
      [`${jobIdPrefix}%`]
    );

    let sequenceNumber = 1;
    if (rows.length > 0) {
      const lastJobId = rows[0].job_id;
      const lastSequenceStr = lastJobId.slice(-6);
      const lastSequenceNum = parseInt(lastSequenceStr, 10);
      sequenceNumber = lastSequenceNum + 1;
    }

    const sequenceStr = sequenceNumber.toString().padStart(6, "0");
    const job_id = jobIdPrefix + sequenceStr;
    console.log(job_id);
    // Call your db logic function
    const response = await registerComplaint({
      customer_id,
      job_id,
      product_serial: serial,
      call_type: callType,
      call_priority: priority,
      full_name: name,
      mobile_number: mobile,
      pin_code: pin,
      locality,
      full_address: address,
      purchase_date: purchaseDate,
      comments,
    });

    return res.status(201).json(response);
  } catch (error) {
    console.error("Error registering complaint:", error);
    return res.status(500).json({ error: "Failed to register complaint" });
  }
});


router.get('/fetchcustomerJobs', async (req, res) => {
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

  try {
    const jobs = await getCustomerJobs(customer_id);
    return res.status(200).json({ jobs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
