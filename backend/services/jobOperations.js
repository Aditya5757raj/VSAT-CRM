const { encrypt, decrypt } = require('../utils/cryptoUtils'); // ✅ import encryption
const { Complaint, Customer, Product } = require('../models');

// Register Complaint
const registerComplaint = async ({
  complaint_id,
  request_type,
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
  job_status,
  pincode,
  mobile_number,
  address,
  estimated_product_delivery_date,
  req_creation_date
}) => {
  try {
    await Complaint.create({
      complaint_id,
      request_type,
      root_request_id,
      issue_type,
      customer_request_id,
      ecom_order_id,
      product_type,
      product_name,
      call_priority,
      symptoms,
      warranty,
      model_no,
      serial_number,
      date_of_purchase,
      brand,
      booking_date,
      booking_time,
      customer_name,
      city,
      job_status,
      pincode,
      mobile_number,
      address,
      estimated_product_delivery_date,
      req_creation_date,
    });

    return { message: "Complaint registered successfully", complaint_id };
  } catch (error) {
    console.error("❌ Failed to register complaint:", error.message);
    throw new Error("Failed to register complaint: " + error.message);
  }
};





module.exports = {
  registerComplaint,
};
