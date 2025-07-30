const { ServiceCenter, sequelize } = require('../models');
const { addUser } = require('./userOperations');

const registerServiceCenter = async ({
  center_id,
  partner_name,
  contact_person,
  phone_number,
  email,
  gst_number,
  pan_number,
  aadhar_number,
  company_address,
  gst_certificate,
  pan_card_document,
  aadhar_card_document,
  company_reg_certificate,
  transaction // ✅ Accept transaction from outside
}) => {
  try {
    const { user } = await addUser(partner_name, 'vsat@123', "serviceCenter");

    const serviceCenter = await ServiceCenter.create({
      center_id,
      partner_name,
      contact_person,
      phone_number,
      email,
      gst_number,
      pan_number,
      aadhar_number,
      company_address,
      gst_certificate,
      pan_card_document,
      aadhar_card_document,
      company_reg_certificate,
      user_id: user.user_id
    }, { transaction }); // ✅ Use external transaction

    return {
      message: "✅ Service center registered successfully",
      user,
      serviceCenter
    };
  } catch (error) {
    console.error("❌ Error in registerServiceCenter:", error.message);
    throw new Error("Failed to register service center: " + error.message);
  }
};

module.exports = {registerServiceCenter};
