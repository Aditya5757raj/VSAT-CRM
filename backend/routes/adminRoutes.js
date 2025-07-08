const express = require('express');
const router = express.Router();
const getMulterUpload = require('../services/multer');
const upload = getMulterUpload();
const { sequelize, User,ServiceCenter, OperatingPincode } = require('../models');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { registerServiceCenter } = require("../services/serviceCenter");
const { verifyToken } = require("../services/verifyToken")

async function generateCenterId() {
  const last = await ServiceCenter.findOne({
    order: [['createdAt', 'DESC']]
  });

  let next = 1;

  if (last && last.center_id) {
    const lastNum = parseInt(last.center_id.replace('VSAT', ''), 10);
    if (!isNaN(lastNum)) next = lastNum + 1;
  }

  return `VSAT${String(next).padStart(5, '0')}`;
}
router.post(
  '/register-servicecenter',
  upload.fields([
    { name: 'gst_certificate' },
    { name: 'pan_card_document' },
    { name: 'aadhar_card_document' },
    { name: 'company_reg_certificate' },
    { name: 'pincode_csv', maxCount: 1 }
  ]),
  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const {
        partner_name,
        contact_person,
        phone_number,
        email,
        gst_number,
        pan_number,
        aadhar_number,
        company_address
      } = req.body;

      const files = req.files;

      const center_id = await generateCenterId();

      // ✅ Use registerServiceCenter
      const result = await registerServiceCenter({
        center_id,
        partner_name,
        contact_person,
        phone_number,
        email,
        gst_number,
        pan_number,
        aadhar_number,
        company_address,
        gst_certificate: files.gst_certificate?.[0]?.filename || null,
        pan_card_document: files.pan_card_document?.[0]?.filename || null,
        aadhar_card_document: files.aadhar_card_document?.[0]?.filename || null,
        company_reg_certificate: files.company_reg_certificate?.[0]?.filename || null
      });

      // ✅ Parse CSV & insert pincode data (within same route transaction)
      if (files.pincode_csv?.[0]) {
        const csvPath = path.resolve('uploads/servicecenter_docs', files.pincode_csv[0].filename);
        const pinPromises = [];

        await new Promise((resolve, reject) => {
          fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row) => {
              if (row.pincode && row.services) {
                pinPromises.push(
                  OperatingPincode.create({
                    center_id,
                    pincode: row.pincode,
                    services: row.services
                  }, { transaction })
                );
              }
            })
            .on('end', resolve)
            .on('error', reject);
        });

        await Promise.all(pinPromises);
      }

      await transaction.commit();
      return res.status(201).json({
        message: '✅ Service center registered successfully',
        data: result.serviceCenter,
        user: result.user
      });

    } catch (error) {
      await transaction.rollback();
      console.error("❌ Registration failed:", error);
      return res.status(500).json({
        message: 'Registration failed',
        error: error.message
      });
    }
  }
);


router.post('/getserviceCenter', async (req, res) => {
  try {
    const { pincode } = req.body;

    if (!pincode) {
      return res.status(400).json({ message: 'Pincode is required' });
    }

    // Step 1: Find center_id(s) that operate in the given pincode
    const matchingRecords = await OperatingPincode.findAll({ where: { pincode } });

    if (matchingRecords.length === 0) {
      return res.status(404).json({ message: 'No service center found for this pincode' });
    }

    const centerIds = matchingRecords.map(record => record.center_id);

    // Step 2: Get service center details
    const serviceCenters = await ServiceCenter.findAll({
      where: { center_id: centerIds }
    });

    // Step 3: Get all pincodes for those center_ids
    const allPincodeRecords = await OperatingPincode.findAll({
      where: {
        center_id: centerIds
      }
    });

    // Step 4: Group pincodes by center_id
    const pincodeMap = {};
    allPincodeRecords.forEach(record => {
      if (!pincodeMap[record.center_id]) {
        pincodeMap[record.center_id] = [];
      }
      pincodeMap[record.center_id].push(record.pincode);
    });

    // Step 5: Attach all pincodes to each service center
    const enrichedServiceCenters = serviceCenters.map(center => ({
      ...center.toJSON(),
      pincodes: pincodeMap[center.center_id] || []
    }));

    res.status(200).json({
      message: 'Service centers fetched successfully',
      data: enrichedServiceCenters
    });
  } catch (error) {
    console.error('❌ Error fetching service centers:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;