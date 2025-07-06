const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Complaint = sequelize.define('Complaint', {
  complaint_id: { type: DataTypes.STRING, primaryKey: true },
  request_type: { type: DataTypes.STRING, allowNull: true },
  root_request_id: { type: DataTypes.STRING, allowNull: false },
  customer_request_id: { type: DataTypes.STRING, allowNull: false },
  ecom_order_id: { type: DataTypes.STRING, allowNull: false },
  product_type: { type: DataTypes.STRING, allowNull: false },
  call_priority:{type:DataTypes.STRING,allowNull:true},
  req_creation_date: {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: DataTypes.NOW
},
  booking_date: { type: DataTypes.DATE, allowNull: false },
  booking_time: { type: DataTypes.STRING, allowNull: false },
  customer_name: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  pincode: { type: DataTypes.STRING, allowNull: false },
  mobile_number: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  estimated_product_delivery_date: { type: DataTypes.DATE, allowNull: false },
  issue_type: { type: DataTypes.STRING, allowNull: true },
  product_name: { type: DataTypes.STRING, allowNull: true },
  symptoms: { type: DataTypes.STRING, allowNull: true },
  model_no: { type: DataTypes.STRING, allowNull: true },
  serial_number: { type: DataTypes.STRING, allowNull: true },
  brand: { type: DataTypes.STRING, allowNull: true },
  date_of_purchase: { type: DataTypes.STRING, allowNull: true },
  warranty: { type: DataTypes.STRING, allowNull: true },
  final_Customer_partner_alignment_Date: { type: DataTypes.STRING, allowNull: true },
  Pre_job_connect_with_Cx: { type: DataTypes.STRING, allowNull: true },
  Final_Time_slot_committed_with_Cx_Px: { type: DataTypes.STRING, allowNull: true },
  technician_availability: { type: DataTypes.STRING, allowNull: true },
  job_status: { type: DataTypes.STRING, allowNull: true },
  Unproductive_visit_if_any: { type: DataTypes.STRING, allowNull: true },
  partner_name: { type: DataTypes.STRING, allowNull: true },
  job_end_date: { type: DataTypes.STRING, allowNull: true },
  OGM_Status: { type: DataTypes.STRING, allowNull: true },
  rescheduled_date: { type: DataTypes.STRING, allowNull: true },
  reason_for_rescheduling: { type: DataTypes.STRING, allowNull: true },
  remark_for_rescheduling: { type: DataTypes.STRING, allowNull: true },
  reason_for_cancelled: { type: DataTypes.STRING, allowNull: true },
  remark_for_cancelled: { type: DataTypes.STRING, allowNull: true },
  rf_module_installation_status: { type: DataTypes.STRING, allowNull: true },
  reason_for_rf_not_installed: { type: DataTypes.STRING, allowNull: true },
  remark_for_rf_not_installed: { type: DataTypes.STRING, allowNull: true },
  configuration_done: { type: DataTypes.STRING, allowNull: true },
  wifi_connected: { type: DataTypes.STRING, allowNull: true },
  sme_Remark: { type: DataTypes.STRING, allowNull: true },
  remark_for_extra_mile: { type: DataTypes.STRING, allowNull: true },
  az_rating: { type: DataTypes.STRING, allowNull: true },
  photo_proof_of_installed_RF_Module: { type: DataTypes.STRING, allowNull: true },
  video_proof_of_installed_lock_open: { type: DataTypes.STRING, allowNull: true },
  video_of_bell_notification_coming: { type: DataTypes.STRING, allowNull: true },
  other_remark_if_any: { type: DataTypes.STRING, allowNull: true },
  updated_at: { type: DataTypes.DATE, allowNull: true }

}, {
  tableName: 'complain',
  timestamps: false
});

module.exports = Complaint;
