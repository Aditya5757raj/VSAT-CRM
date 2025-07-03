require('dotenv').config(); // Load SECRET_KEY and other env vars
const { registerComplaint } = require('./jobOperations'); // Only register complaints now
const { sequelize } = require('../models'); // Ensure DB is connected

const complaints = [
  {
    complaint_id: 'CMP021',
    customer_id: null,
    product_id: null,
    call_type: 'RE',
    pincode: '110008',
    symptoms: 'Display has dead pixels',
    customer_available_at: 'Morning',
    preferred_time_slot: '10 AM - 12 PM',
    call_priority: 'High',
    status: 'Assigned'
  },
  {
    complaint_id: 'CMP022',
    customer_id: null,
    product_id: null,
    call_type: 'IN',
    pincode: '110009',
    symptoms: 'Speakers making static noise',
    customer_available_at: 'Afternoon',
    preferred_time_slot: '1 PM - 3 PM',
    call_priority: 'Medium',
    status: 'Unassigned'
  },
  {
    complaint_id: 'CMP023',
    customer_id: null,
    product_id: null,
    call_type: 'RE',
    pincode: '110010',
    symptoms: 'Remote not functioning',
    customer_available_at: 'Evening',
    preferred_time_slot: '5 PM - 7 PM',
    call_priority: 'Low',
    status: 'Pending'
  },
  {
    complaint_id: 'CMP024',
    customer_id: null,
    product_id: null,
    call_type: 'IN',
    pincode: '110011',
    symptoms: 'Software update failed',
    customer_available_at: 'Morning',
    preferred_time_slot: '9 AM - 11 AM',
    call_priority: 'High',
    status: 'Completed'
  },
  {
    complaint_id: 'CMP025',
    customer_id: null,
    product_id: null,
    call_type: 'RE',
    pincode: '110012',
    symptoms: 'TV randomly restarts',
    customer_available_at: 'Afternoon',
    preferred_time_slot: '2 PM - 4 PM',
    call_priority: 'Low',
    status: 'Cancelled'
  },
  {
    complaint_id: 'CMP026',
    customer_id: null,
    product_id: null,
    call_type: 'IN',
    pincode: '110013',
    symptoms: 'Bluetooth not connecting',
    customer_available_at: 'Morning',
    preferred_time_slot: '10 AM - 11 AM',
    call_priority: 'High',
    status: 'Assigned'
  },
  {
    complaint_id: 'CMP027',
    customer_id: null,
    product_id: null,
    call_type: 'RE',
    pincode: '110014',
    symptoms: 'Image freezing during playback',
    customer_available_at: 'Evening',
    preferred_time_slot: '6 PM - 8 PM',
    call_priority: 'Medium',
    status: 'Unassigned'
  },
  {
    complaint_id: 'CMP028',
    customer_id: null,
    product_id: null,
    call_type: 'IN',
    pincode: '110015',
    symptoms: 'Color distortion issue',
    customer_available_at: 'Morning',
    preferred_time_slot: '9 AM - 11 AM',
    call_priority: 'High',
    status: 'Pending'
  },
  {
    complaint_id: 'CMP029',
    customer_id: null,
    product_id: null,
    call_type: 'RE',
    pincode: '110016',
    symptoms: 'TV not responding to buttons',
    customer_available_at: 'Afternoon',
    preferred_time_slot: '1 PM - 2 PM',
    call_priority: 'Medium',
    status: 'Completed'
  },
  {
    complaint_id: 'CMP030',
    customer_id: null,
    product_id: null,
    call_type: 'IN',
    pincode: '110017',
    symptoms: 'No internet access on smart features',
    customer_available_at: 'Evening',
    preferred_time_slot: '4 PM - 6 PM',
    call_priority: 'Low',
    status: 'Cancelled'
  }
];

const seedComplaints = async () => {
  try {
    // Insert complaints only (skip customer/product)
    for (const data of complaints) {
      await registerComplaint(data);
    }

    console.log("✅ All complaints inserted successfully.");
    process.exit(0);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      console.error("❌ Sequelize Validation Details:", error.errors);
    }
    console.error("❌ Error seeding complaints:", error.message);
    process.exit(1);
  }
};

seedComplaints();
