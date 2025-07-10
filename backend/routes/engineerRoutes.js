const express = require('express');
const router = express.Router();
const { Complaint,Engineer,TechnicianInformation} = require('../models');
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
    console.log(req.body);
    const {
      eng_name, email, contact,qualification, product,
      operating_pincode, pan_number, aadhar_number, driving_license_number
    } = req.body;

    const lastEntry = await TechnicianInformation.findOne({ order: [['engineer_id', 'DESC']] });
    const engineer_id = generateNextEngineerId(lastEntry?.engineer_id);

    const technician = await TechnicianInformation.create({
      engineer_id,
      eng_name,
      email,
      contact,
      qualification,
      product,
      operating_pincode,
      pan_number,
      aadhar_number,
      driving_license_number,
      pan_card: req.files['pan_card']?.[0]?.filename || null,
      aadhar_card: req.files['aadhar_card']?.[0]?.filename || null,
      driving_licence: req.files['driving_licence']?.[0]?.filename || null,
      service_center_id: userId  // ✅ Save userId as service_center_id
    });

    res.status(201).json({ success: true, data: technician });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /listengineer - list engineers for the logged-in service center
router.get('/listengineer', async (req, res) => {
  try {
    console.log("listing the engieer request");
    const userId = verifyToken(req);

    if (!userId) return res.status(401).json({ message: "Unauthorized: Missing userId" });

    const engineers = await TechnicianInformation.findAll({
      where: { service_center_id: userId },
      order: [['created_at']]
    });
    res.json({ success: true, data: engineers });
  } catch (error) {
    console.error('❌ Error fetching engineers:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;


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
            operating_pincode, pan_number, aadhar_number, driving_license_number, status
        } = req.body;

        // 🔍 Step 1: Fetch existing engineer data
        const existingEngineer = await TechnicianInformation.findOne({
            where: { engineer_id: engineerId }
        });

        if (!existingEngineer) {
            return res.status(404).json({ message: "Engineer not found." });
        }

        // 🛠 Step 2: Prepare update object with existing file values
        const updateFields = {
            eng_name,
            email,
            contact,
            qualification,
            product,
            operating_pincode,
            pan_number,
            aadhar_number,
            driving_license_number,
            status,
            pan_card: existingEngineer.pan_card,             // default to existing
            aadhar_card: existingEngineer.aadhar_card,       // default to existing
            driving_licence: existingEngineer.driving_licence // default to existing
        };

        // 📥 Step 3: Override only if new files are uploaded
        if (req.files['pan_card']) {
            updateFields.pan_card = req.files['pan_card'][0].filename;
        }
        if (req.files['aadhar_card']) {
            updateFields.aadhar_card = req.files['aadhar_card'][0].filename;
        }
        if (req.files['driving_licence']) {
            updateFields.driving_licence = req.files['driving_licence'][0].filename;
        }

        // 🔄 Step 4: Perform the update
        const [updated] = await TechnicianInformation.update(updateFields, {
            where: { engineer_id: engineerId }
        });

        if (updated === 0) {
            return res.status(404).json({ message: "No changes made." });
        }

        res.json({ message: "✅ Engineer updated successfully." });
    } catch (error) {
        console.error("❌ Update error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

module.exports = router;
