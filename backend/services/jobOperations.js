const db = require("../config/db");

const registerComplaint = async ({
  customer_id,
  job_id,
  call_type,
  call_priority,
  full_name,
  mobile_number,
  house_no,
  street,
  landmark,
  pin_code,
  locality,
  product_type,
  city,
  state_code,
  available_date,
  preferred_time,
  comments,
  full_address
}) => {
  const insertQuery = `
    INSERT INTO jobs (
      job_id,
      customer_id,
      call_type,
      call_priority,
      full_name,
      mobile_number,
      house_no,
      street,
      landmark,
      pin_code,
      locality,
      product_type,
      city,
      state_code,
      available_date,
      preferred_time,
      comments,
      full_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    job_id,
    customer_id,
    call_type,
    call_priority,
    full_name,
    mobile_number,
    house_no || null,
    street || null,
    landmark || null,
    pin_code,
    locality,
    product_type || null,
    city || null,
    state_code || null,
    available_date || null,
    preferred_time || null,
    comments && comments.trim() !== '' ? comments : null,
    full_address
  ];

  await db.execute(insertQuery, params);

  return { message: "Complaint registered successfully", job_id };
};

// ✅ Function to fetch all jobs of a customer
const getCustomerJobs = async (mobile_number, pin_code) => {
  const query = `
    SELECT 
      job_id,
      call_type,
      call_priority,
      full_name,
      mobile_number,
      pin_code,
      locality,
      full_address,
      comments,
      created_at
    FROM jobs
    WHERE mobile_number = ? AND pin_code = ?
    ORDER BY created_at DESC
  `;

  try {
    const [rows] = await db.execute(query, [mobile_number, pin_code]);

    return rows || [];
  } catch (error) {
    console.error("❌ Error fetching jobs:", error.message);
    throw new Error("Failed to fetch customer jobs: " + error.message);
  }
};

module.exports = {
  registerComplaint,
  getCustomerJobs
};
