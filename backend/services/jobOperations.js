const { encrypt,decrypt } = require('../utils/cryptoUtils'); // ✅ import encryption
const { Complaint, Customer, Product } = require('../models');

// Register Complaint
const registerComplaint = async ({
  complaint_id,
  customer_id,
  product_id,
  call_type,
  pincode,
  symptoms,
  customer_available_at,
  preferred_time_slot,
  call_priority
}) => {
  try {
    await Complaint.create({
      complaint_id,
      customer_id,
      product_id,
      call_type,
      pincode: encrypt(pincode),
      symptoms: symptoms ? encrypt(symptoms) : null,
      customer_available_at,
      preferred_time_slot,
      call_priority,
      status: 'Unassigned'
    });

    return { message: "Complaint registered successfully", complaint_id };
  } catch (error) {
    console.error("❌ Failed to register complaint:", error.message);
    throw new Error("Failed to register complaint: " + error.message);
  }
};

// Register Customer
const registerCustomer = async ({
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
}) => {
  try {
    const existingCustomer = await Customer.findOne({ where: { customer_id } });
    if (existingCustomer) {
      console.log("ℹ️ Customer already exists:", customer_id);
      return;
    }

    const customer = await Customer.create({
      customer_id,
      full_name: encrypt(full_name),
      mobile_number: encrypt(mobile_number),
      flat_no: encrypt(flat_no),
      street_area: encrypt(street_area),
      landmark: encrypt(landmark),
      pincode: encrypt(pincode),
      locality: encrypt(locality),
      city: encrypt(city),
      state: encrypt(state)
    });

    return { message: "Customer registered successfully", customer };
  } catch (error) {
    console.error("❌ Failed to register customer:", error.message);
    throw new Error("Failed to register customer: " + error.message);
  }
};

// Register Product
const registerProduct = async ({
  product_id,
  product_type,
  product_name,
  model_number,
  serial_number,
  brand,
  date_of_purchase,
  warranty
}) => {
  try {
    const existingProduct = await Product.findOne({ where: { product_id } });
    if (existingProduct) {
      console.log("ℹ️ Product already exists:", product_id);
      return;
    }

    const product = await Product.create({
      product_id,
      product_type,
      product_name: encrypt(product_name),
      model_number: encrypt(model_number),
      serial_number: encrypt(serial_number),
      brand: encrypt(brand),
      date_of_purchase,
      warranty
    });

    return { message: "Product registered successfully", product };
  } catch (error) {
    console.error("❌ Failed to register product:", error.message);
    throw new Error("Failed to register product: " + error.message);
  }
};
const getComplaintDetails = async (complaint_id) => {
  try {
    const complaint = await Complaint.findOne({
      where: { complaint_id },
      include: [
        {
          model: Customer,
          attributes: ['customer_id', 'full_name', 'mobile_number', 'flat_no', 'street_area', 'landmark', 'pincode', 'locality', 'city', 'state']
        },
        {
          model: Product,
          attributes: ['product_id', 'product_type', 'product_name', 'model_number', 'serial_number', 'brand', 'date_of_purchase', 'warranty']
        }
      ]
    });

    if (!complaint) {
      throw new Error(`Complaint with ID ${complaint_id} not found`);
    }

    // Decrypt sensitive fields
    const decryptedCustomer = {
      ...complaint.Customer?.toJSON(),
      full_name: decrypt(complaint.Customer?.full_name),
      mobile_number: decrypt(complaint.Customer?.mobile_number),
      flat_no: decrypt(complaint.Customer?.flat_no),
      street_area: decrypt(complaint.Customer?.street_area),
      landmark: decrypt(complaint.Customer?.landmark),
      pincode: decrypt(complaint.Customer?.pincode),
      locality: decrypt(complaint.Customer?.locality),
      city: decrypt(complaint.Customer?.city),
      state: decrypt(complaint.Customer?.state),
    };

    const decryptedProduct = {
      ...complaint.Product?.toJSON(),
      product_name: decrypt(complaint.Product?.product_name),
      model_number: decrypt(complaint.Product?.model_number),
      serial_number: decrypt(complaint.Product?.serial_number),
      brand: decrypt(complaint.Product?.brand),
    };

    const result = {
      ...complaint.toJSON(),
      pincode: decrypt(complaint.pincode),
      symptoms: complaint.symptoms ? decrypt(complaint.symptoms) : null,
      Customer: decryptedCustomer,
      Product: decryptedProduct,
    };

    return result;
  } catch (error) {
    console.error("❌ Failed to fetch complaint details:", error.message);
    throw new Error("Failed to fetch complaint details: " + error.message);
  }
};

module.exports = {
  registerComplaint,
  registerCustomer,
  registerProduct,
  getComplaintDetails
};
