const express = require('express');
const router = express.Router();
const { Complaint,Engineer} = require('../models');

// POST /engineer/assign
router.post('/assign', async (req, res) => {
    const { complaint_id, engineer_name, engineer_phone_no } = req.body;

    if (!complaint_id || !engineer_name || !engineer_phone_no) {
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

        // ✅ Create new engineer assignment
        await Engineer.create({
            complaint_id,
            engineer_name,
            engineer_phone_no
        });

        // 🔄 Update complaint status to "Pending" and updated_at timestamp
        await Complaint.update(
            {
                job_status: 'Pending',
                updated_at: new Date()  // Explicitly update timestamp
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


module.exports = router;
