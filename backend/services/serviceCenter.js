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
  company_reg_certificate
}) => {
  const transaction = await sequelize.transaction();

  try {
    const { user } = await addUser(partner_name,'vsat@123',"serviceCenter");
    // ✅ Create Service Center with user_id from addUser
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
    }, { transaction });

    await transaction.commit();
    return {
      message: "✅ Service center registered successfully",
      user,
      serviceCenter
    };
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error in registerServiceCenter:", error.message);
    throw new Error("Failed to register service center: " + error.message);
  }
};

module.exports = {registerServiceCenter};
