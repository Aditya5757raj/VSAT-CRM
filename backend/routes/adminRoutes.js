const express = require('express');
const router = express.Router();
const getMulterUpload = require('../services/multer');
const upload = getMulterUpload();
const { sequelize, User,ServiceCenter, OperatingPincode,CcAgent } = require('../models');
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
async function generateCcAgentId() {
  console.log('🔄 Generating new CC Agent ID...');

  const last = await CcAgent.findOne({
    order: [['id', 'DESC']] // ← ORDER BY id DESC, not createdAt
  });

  let next = 1;

  if (last && last.id) {
    const lastNum = parseInt(last.id.replace('CC', ''), 10);
    if (!isNaN(lastNum)) {
      console.log('📦 Last ccagent_id found:', last.id);
      next = lastNum + 1;
    }
  }

  const newId = `CC${String(next).padStart(5, '0')}`;
  console.log('✅ Generated ccagent_id:', newId);
  return newId;
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

      // ✅ Pass the transaction into the service center registration
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
        company_reg_certificate: files.company_reg_certificate?.[0]?.filename || null,
        transaction // ✅ Pass it here
      });

      // ✅ Parse CSV & insert pincode data within the same transaction
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
                  }, { transaction }) // ✅ Use same transaction
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

router.post('/addccgenet', async (req, res) => {
  try {
    console.log('📥 Incoming CC Agent Data:', req.body);

    const { fullName, email, phone, brands } = req.body;

    if (!fullName || !email || !phone || !Array.isArray(brands) || brands.length === 0) {
      console.warn('⚠️ Validation failed: Missing fields');
      return res.status(400).json({ error: 'All fields are required with at least one brand.' });
    }

    const phonePattern = /^[6-9]\d{9}$/;
    if (!phonePattern.test(phone)) {
      console.warn('⚠️ Invalid phone number:', phone);
      return res.status(400).json({ error: 'Invalid phone number format.' });
    }

    // ✅ Create User
    const user = await User.create({
      username: fullName,
      password: 'vsat@123',
      role: 'ccagent',
      firstLogin: true
    });
    console.log('✅ User created:', user.user_id);

    // ✅ Generate new ccagent_id
    const ccagent_id = await generateCcAgentId();
    console.log('🆔 Generated ccagent_id:', ccagent_id);

    // ✅ Create CC Agent
    const newAgent = await CcAgent.create({
      id: ccagent_id,
      fullName,
      email,
      phone,
      brands,
      user_id: user.user_id
    });
    console.log('✅ CC Agent registered:', newAgent.id);

    res.status(201).json({
      message: 'Agent and User registered successfully',
      agent: newAgent
    });

  } catch (err) {
    console.error('❌ Error during CC Agent registration:', err);
    res.status(500).json({ error: 'Failed to register agent and user' });
  }
});


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
router.get('/getAllServiceCenters', async (req, res) => {
  try {
    // Step 1: Get all service centers
    const serviceCenters = await ServiceCenter.findAll();

    if (serviceCenters.length === 0) {
      return res.status(404).json({ message: 'No service centers found' });
    }

    // Step 2: Extract all center_ids
    const centerIds = serviceCenters.map(center => center.center_id);

    // Step 3: Get all pincodes associated with those center_ids
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

    // Step 5: Attach pincodes to each service center
    const enrichedServiceCenters = serviceCenters.map(center => ({
      ...center.toJSON(),
      pincodes: pincodeMap[center.center_id] || []
    }));

    res.status(200).json({
      message: 'All service centers fetched successfully',
      data: enrichedServiceCenters
    });
  } catch (error) {
    console.error('❌ Error fetching all service centers:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});
router.get('/getServiceCenterPassword/:center_id', async (req, res) => {
  try {
    // 1. Extract user_id from token
    const user_id = verifyToken(req);
    console.log(`🔐 Verified token. User ID: ${user_id}`);

    // 2. Fetch the requesting user
    const requestingUser = await User.findByPk(user_id);
    if (!requestingUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }

    // 3. Check if the requesting user is an admin
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    // 4. Fetch ServiceCenter details using center_id
    const centerId = req.params.center_id;
    const center = await ServiceCenter.findOne({
      where: { center_id: centerId }
    });

    if (!center) {
      return res.status(404).json({ message: 'Service center not found' });
    }

    // 5. Fetch the associated user's password using user_id
    const targetUser = await User.findOne({
      where: { user_id: center.user_id },
      attributes: ['password']
    });

    if (!targetUser) {
      return res.status(404).json({ message: 'Associated user not found' });
    }

    // 6. Send the password
    res.status(200).json({ password: targetUser.password });

  } catch (error) {
    console.error('❌ Error fetching password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/updateServiceCenter/:id', upload.fields([
  { name: 'gst_certificate' },
  { name: 'pan_card' },
  { name: 'aadhar_card' },
  { name: 'company_registration_certificate' },
  { name: 'editPincode' }
]), async (req, res) => {
  try {
    const centerId = req.params.id;
    console.log(`🛠️ Update request received for Service Center ID: ${centerId}`);

    const {
      partner_name,
      contact_person,
      email,
      phone_number,
      gst_number,
      pan_number,
      aadhar_number,
      company_address,
      status,
      new_password
    } = req.body;

    console.log('📥 Received form data:', {
      partner_name, contact_person, email, phone_number,
      gst_number, pan_number, aadhar_number, company_address, status
    });

    const center = await ServiceCenter.findByPk(centerId);
    if (!center) {
      console.warn(`❌ No service center found with ID: ${centerId}`);
      return res.status(404).json({ message: 'Service center not found' });
    }

    const updateData = {
      partner_name,
      contact_person,
      email,
      phone_number,
      gst_number,
      pan_number,
      aadhar_number,
      company_address,
      status,
      gst_certificate: req.files['gst_certificate'] ? req.files['gst_certificate'][0].filename : center.gst_certificate,
      pan_card_document: req.files['pan_card'] ? req.files['pan_card'][0].filename : center.pan_card_document,
      aadhar_card_document: req.files['aadhar_card'] ? req.files['aadhar_card'][0].filename : center.aadhar_card_document,
      company_reg_certificate: req.files['company_registration_certificate'] ? req.files['company_registration_certificate'][0].filename : center.company_reg_certificate
    };

    console.log('📄 Fields to be updated in DB:', updateData);

    await center.update(updateData);
    console.log(`✅ Service center (ID: ${centerId}) basic details updated.`);

    if (new_password && center.user_id) {
      await User.update({ password: new_password }, { where: { user_id: center.user_id } });
      console.log(`🔐 Password updated for user_id: ${center.user_id}`);
    }

    // ✅ Handle editPincode file if present
    const pincodeFile = req.files['editPincode']?.[0];

    if (pincodeFile) {
      console.log('📦 editPincode file uploaded. Starting parsing...');

      const filePath = pincodeFile.path;
      console.log(`📂 CSV file path: ${filePath}`);

      const pincodeRows = [];

      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            if (row.pincode && row.services) {
              console.log(`📌 CSV row parsed:`, row);
              pincodeRows.push({
                center_id: centerId,
                pincode: row.pincode.toString().trim(),
                services: row.services.toString().trim()
              });
            } else {
              console.warn('⚠️ Skipped row due to missing fields:', row);
            }
          })
          .on('end', resolve)
          .on('error', (err) => {
            console.error('❌ Error reading CSV file:', err);
            reject(err);
          });
      });

      console.log(`🧹 Deleting old pincodes for center_id: ${centerId}`);
      await OperatingPincode.destroy({ where: { center_id: centerId } });

      if (pincodeRows.length > 0) {
        await OperatingPincode.bulkCreate(pincodeRows);
        console.log(`✅ ${pincodeRows.length} new pincodes inserted for center_id: ${centerId}`);
      } else {
        console.warn('⚠️ No valid rows found in editPincode CSV.');
      }
    } else {
      console.log('ℹ️ No editPincode file uploaded, skipping pincode update.');
    }

    console.log('🎉 All updates completed successfully.');
    return res.status(200).json({ message: 'Service Center updated successfully' });

  } catch (error) {
    console.error('❌ Error updating service center:', error);
    return res.status(500).json({ message: 'Server error during update' });
  }
});

module.exports = router;