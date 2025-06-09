const db = require("../config/db");

const registerComplaint = async ({
  customer_id,
  job_id,
  product_serial,
  call_type,
  call_priority,
  full_name,
  mobile_number,
  pin_code,
  locality,
  full_address,
  purchase_date,
  comments
}) => {
  const insertQuery = `
    INSERT INTO jobs (
      job_id,
      customer_id,
      product_serial,
      call_type,
      call_priority,
      full_name,
      mobile_number,
      pin_code,
      locality,
      full_address,
      purchase_date,
      comments
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    job_id,
    customer_id,
    product_serial,
    call_type,
    call_priority,
    full_name,
    mobile_number,
    pin_code,
    locality,
    full_address,
    purchase_date,
    comments && comments.trim() !== '' ? comments : null
  ];

  await db.execute(insertQuery, params);

  return { message: "Complaint registered successfully", job_id };
};

// ✅ New function to fetch all jobs of a customer
const getCustomerJobs = async (customer_id) => {
  const query = `
    SELECT 
      job_id,
      product_serial,
      call_type,
      call_priority,
      full_name,
      mobile_number,
      pin_code,
      locality,
      full_address,
      purchase_date,
      comments,
      created_at
    FROM jobs
    WHERE customer_id = ?
    ORDER BY created_at DESC
  `;

  try {
    const [rows] = await db.execute(query, [customer_id]);

    if (!rows || rows.length === 0) {
      return [];
    }

    return rows;
  } catch (error) {
    console.error("❌ Error fetching jobs:", error.message);
    throw new Error("Failed to fetch customer jobs: " + error.message);
  }
};

module.exports = {
  registerComplaint,
  getCustomerJobs
};
