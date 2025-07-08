const express = require("express");
const { Op } = require("sequelize");
const { sequelize, User, ServiceCenter, OperatingPincode, Complaint } = require('../models');
const { getComplaintDetails } = require("../services/jobOperations");
const { verifyToken } = require("../services/verifyToken");
const router = express.Router();

const fetchComplaints = async (req, res, statusKey, jobStatus) => {
  try {
    const userId = verifyToken(req);
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const { from_date, to_date, issue_type, call_type } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const complaintWhere = {
      job_status: jobStatus
    };

    // 🚧 Role-based filtering
    if (user.role.toLowerCase() === 'servicecenter') {
      const serviceCenter = await ServiceCenter.findOne({ where: { user_id: userId } });
      if (!serviceCenter) return res.status(404).json({ message: "Service Center not found" });

      const operatedPincodes = await OperatingPincode.findAll({
        where: { center_id: serviceCenter.center_id },
        attributes: ['pincode']
      });

      const pincodeList = operatedPincodes.map(p => p.pincode);
      if (pincodeList.length === 0) return res.status(200).json({ complaints: [] });

      // Apply pincode filtering for Service Center
      complaintWhere.pincode = { [Op.in]: pincodeList };

    } else if (user.role.toLowerCase() === 'admin') {
      // Admins get full access, no pincode filtering
      console.log("✅ Admin access: fetching all complaints by status.");
      
    } else {
      // 🚫 Other roles (optional restriction)
      return res.status(403).json({ message: "Unauthorized role access" });
    }

    // 📅 Date filters
    if (from_date && to_date) {
      complaintWhere.req_creation_date = {
        [Op.between]: [
          new Date(`${from_date}T00:00:00.000Z`),
          new Date(`${to_date}T23:59:59.999Z`)
        ]
      };
    }

    // Optional filters
    if (issue_type) complaintWhere.issue_type = issue_type;
    if (call_type && jobStatus === 'Completed') complaintWhere.call_type = call_type;

    // Fetch complaints
    const complaints = await Complaint.findAll({ where: complaintWhere });

    const detailedComplaints = await Promise.all(
      complaints.map(c => getComplaintDetails(c.complaint_id).catch(() => null))
    );

    const validComplaints = detailedComplaints.filter(c => c !== null);

    return res.status(200).json({ complaints: validComplaints });

  } catch (error) {
    console.error(`❌ Error in ${statusKey}:`, error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};


router.post('/getUnassigned', (req, res) => fetchComplaints(req, res, "getUnassigned", "Unassigned"));
router.post('/getAssigned', (req, res) => fetchComplaints(req, res, "getAssigned", "Assigned"));
router.post('/getPending', (req, res) => fetchComplaints(req, res, "getPending", "Pending"));
router.post('/getCompleted', (req, res) => fetchComplaints(req, res, "getCompleted", "Completed"));
router.post('/getCancelled', (req, res) => fetchComplaints(req, res, "getCancelled", "Cancelled"));

router.put('/update', async (req, res) => {
    const { complaint_id, ...updates } = req.body;
    console.log(complaint_id+"is coming to update")
    if (!complaint_id) {
        return res.status(400).json({ success: false, message: 'Complaint ID is required' });
    }
    
    try {
        const [updated] = await Complaint.update(updates, { where: { complaint_id } });

        if (updated === 0) {
            return res.status(404).json({ success: false, message: 'Complaint not found or not updated' });
        }

        res.json({ success: true, message: 'Complaint updated successfully' });

    } catch (err) {
        console.error("❌ Error updating complaint:", err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


module.exports = router;
