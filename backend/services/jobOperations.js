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

module.exports={registerComplaint};