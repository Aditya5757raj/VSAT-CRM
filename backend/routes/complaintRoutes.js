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

    const serviceCenter = await ServiceCenter.findOne({ where: { user_id: userId } });
    if (!serviceCenter) return res.status(404).json({ message: "Service Center not found" });

    const operatedPincodes = await OperatingPincode.findAll({
      where: { center_id: serviceCenter.center_id },
      attributes: ['pincode']
    });

    const pincodeList = operatedPincodes.map(p => p.pincode);
    if (pincodeList.length === 0) return res.status(200).json({ complaints: [] });

    const complaintWhere = {
      pincode: { [Op.in]: pincodeList },
      job_status: jobStatus
    };

    if (from_date && to_date) {
      complaintWhere.req_creation_date = {
        [Op.between]: [
          new Date(`${from_date}T00:00:00.000Z`),
          new Date(`${to_date}T23:59:59.999Z`)
        ]
      };
    }

    if (issue_type) complaintWhere.issue_type = issue_type;
    if (call_type && jobStatus === 'Completed') complaintWhere.call_type = call_type;

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

module.exports = router;
