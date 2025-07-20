const express = require('express');
const router = express.Router();
const { Complaint,Engineer,TechnicianInformation,TechnicianPincode,User,ServiceCenter} = require('../models');
const getMulterUpload = require('../services/multer');
const { verifyToken } = require("../services/verifyToken");


const upload = getMulterUpload('uploads/technician_information'); // 👈 target folder changed

const docUpload = upload.fields([
  { name: 'pan_card', maxCount: 1 },
  { name: 'aadhar_card', maxCount: 1 },
  { name: 'driving_licence', maxCount: 1 } // ✅ correct spelling
]);

function generateNextEngineerId(lastId) {
  if (!lastId) return 'ENG00001';
  const num = parseInt(lastId.replace('ENG', ''), 10) + 1;
  return 'ENG' + String(num).padStart(5, '0');
}

router.post('/addEngineer', docUpload, async (req, res) => {
  try {
    const userId = verifyToken(req);
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const {
      eng_name,
      email,
      contact,
      qualification,
      product,
      operating_pincode, // Example: "110003,10004"
      pan_number,
      aadhar_number,
      driving_license_number,assigned_service_partner
    } = req.body;
    console.log(req.body);

    const lastEntry = await TechnicianInformation.findOne({ order: [['engineer_id', 'DESC']] });
    const engineer_id = generateNextEngineerId(lastEntry?.engineer_id);

    const technician = await TechnicianInformation.create({
      engineer_id,
      eng_name,
      email,
      contact,
      qualification,
      product,
      pan_number,
      aadhar_number,
      driving_license_number,
      pan_card: req.files['pan_card']?.[0]?.filename || null,
      aadhar_card: req.files['aadhar_card']?.[0]?.filename || null,
      driving_licence: req.files['driving_licence']?.[0]?.filename || null,
      service_center_id:assigned_service_partner
    });

    // ✅ Convert comma-separated pincode string into array
    const pincodeArray = operating_pincode
      .split(',')
      .map(p => p.trim())
      .filter(p => p !== '');

    const pincodeRecords = pincodeArray.map(pincode => ({
      engineer_id,
      pincode
    }));

    await TechnicianPincode.bulkCreate(pincodeRecords);

    res.status(201).json({ success: true, data: technician, pincodes: pincodeRecords });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

router.get('/listengineer', async (req, res) => {
  try {
    console.log("📥 Listing the engineer request");

    const userId = verifyToken(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized: Missing userId" });

    // ✅ Fetch user and check role first
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userRole = user.role?.toLowerCase();

    let queryOptions = {
      include: [
        {
          model: TechnicianPincode,
          as: 'pincodes',
          attributes: ['pincode']
        }
      ],
      order: [['created_at', 'DESC']]
    };

    if (userRole === 'admin') {
      // Admin sees all engineers
    } else if (userRole === 'servicecenter') {
      // ✅ Fetch associated service center
      const service_center = await ServiceCenter.findOne({ where: { user_id: userId } });
      if (!service_center) return res.status(404).json({ message: "Service Center not found" });

      queryOptions.where = { service_center_id: service_center.partner_name };
    } else {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    const engineers = await TechnicianInformation.findAll(queryOptions);
    res.json({ success: true, data: engineers });

  } catch (error) {
    console.error('❌ Error fetching engineers:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

router.get('/:complaint_id', async (req, res) => {
  try {
    const { complaint_id } = req.params;

    if (!complaint_id) {
      return res.status(400).json({ message: 'complaint_id is required' });
    }

    // Fetch engineer along with related complaint (optional)
    const engineer = await Engineer.findOne({
      where: { complaint_id },
      include: [{ model: Complaint }]
    });

    if (!engineer) {
      return res.status(404).json({ message: 'Engineer not found for this complaint ID' });
    }

    res.status(200).json(engineer);
  } catch (error) {
    console.error('❌ Error fetching engineer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/listassignengineer', async (req, res) => {
  const complaintId = req.query.complaintId;

  try {
    if (!complaintId) {
      return res.status(400).json({ message: 'Complaint ID is required' });
    }

    // Step 1️⃣: Fetch the complaint and get its pincode
    const complaint = await Complaint.findOne({
      where: { complaint_id: complaintId }
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const complaintPincode = complaint.pincode;

    // Step 2️⃣: Find engineers whose pincode matches in TechnicianPincode
    const matchingTechnicians = await TechnicianInformation.findAll({
      include: [
        {
          model: TechnicianPincode,
          as: 'pincodes',
          where: {
            pincode: complaintPincode
          },
          attributes: [] // we don’t need to include pincode again
        }
      ],
      where: {
        status: 'active' // optional: only active technicians
      }
    });

    res.json({ data: matchingTechnicians });

  } catch (err) {
    console.error('❌ Error fetching matched engineers:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// POST /engineer/assign
router.post('/assign', async (req, res) => {
    const { complaint_id, engineer_name } = req.body;

    if (!complaint_id || !engineer_name) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    try {
        // ✅ Check if complaint exists
        const complaint = await Complaint.findByPk(complaint_id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found." });
        }

        // ❌ Prevent duplicate assignment
        const existing = await Engineer.findOne({ where: { complaint_id } });
        if (existing) {
            return res.status(400).json({ success: false, message: "Engineer already assigned." });
        }

        // ✅ Create new engineer assignment (without phone number)
        await Engineer.create({
            complaint_id,
            engineer_name
            // engineer_phone_no is now optional or can be null in DB
        });

        // 🔄 Update complaint status to "Pending" and timestamp
        await Complaint.update(
            {
                job_status: 'Pending',
                updated_at: new Date()
            },
            {
                where: { complaint_id }
            }
        );

        res.json({ success: true, message: "Engineer assigned and job status updated to PENDING." });

    } catch (error) {
        console.error("❌ Error assigning engineer:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

router.put('/update/:id', docUpload, async (req, res) => {
    const engineerId = req.params.id;

    try {
        const {
            eng_name, email, contact, qualification, product,
            operating_pincode, pan_number, aadhar_number,
            driving_license_number, status
        } = req.body;

        // 🔍 Step 1: Find the existing engineer
        const existingEngineer = await TechnicianInformation.findOne({
            where: { engineer_id: engineerId }
        });

        if (!existingEngineer) {
            return res.status(404).json({ message: "Engineer not found." });
        }

        // 🛠 Step 2: Prepare update fields
        const updateFields = {
            eng_name,
            email,
            contact,
            qualification,
            product,
            pan_number,
            aadhar_number,
            driving_license_number,
            status,
            pan_card: existingEngineer.pan_card,
            aadhar_card: existingEngineer.aadhar_card,
            driving_licence: existingEngineer.driving_licence
        };

        // 📁 Step 3: Handle uploaded files
        if (req.files['pan_card']) {
            updateFields.pan_card = req.files['pan_card'][0].filename;
        }
        if (req.files['aadhar_card']) {
            updateFields.aadhar_card = req.files['aadhar_card'][0].filename;
        }
        if (req.files['driving_licence']) {
            updateFields.driving_licence = req.files['driving_licence'][0].filename;
        }

        // 🔄 Step 4: Update TechnicianInformation
        await TechnicianInformation.update(updateFields, {
            where: { engineer_id: engineerId }
        });

        // 🧹 Step 5: Remove existing pincodes
        await TechnicianPincode.destroy({
            where: { engineer_id: engineerId }
        });

        // ➕ Step 6: Add new pincodes
        const pincodesArray = Array.isArray(operating_pincode)
            ? operating_pincode
            : typeof operating_pincode === 'string'
              ? operating_pincode.split(',').map(p => p.trim())
              : [];

        const pincodeInserts = pincodesArray.map(pincode => ({
            engineer_id: engineerId,
            pincode
        }));

        if (pincodeInserts.length > 0) {
            await TechnicianPincode.bulkCreate(pincodeInserts);
        }

        res.json({ message: "✅ Engineer and pincodes updated successfully." });
    } catch (error) {
        console.error("❌ Update error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

module.exports = router;
