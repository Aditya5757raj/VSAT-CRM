const express = require("express");
const { Op } = require("sequelize");
const { sequelize, User, ServiceCenter, OperatingPincode, Complaint } = require('../models');
const { encrypt, decrypt } = require("../utils/cryptoUtils");
const { getComplaintDetails } = require("../services/jobOperations")
const { verifyToken } = require("../services/verifyToken")
const router = express.Router();

router.post('/getUnassigned', async (req, res) => {
    try {
        const userId = verifyToken(req);
        console.log("📥 Request received for /getUnassigned");
        const { from_date, to_date, call_type} = req.body;
        console.log("🔍 Extracted Request Body:", { from_date, to_date, call_type, userId });

        if (!from_date || !to_date || !call_type || !userId) {
            console.warn("⚠️ Missing required parameters");
            return res.status(400).json({ message: "Missing from_date, to_date, call_type or userId" });
        }

        // Step 1: Find the logged-in service center
        const serviceCenter = await ServiceCenter.findOne({ where: { user_id: userId } });
        console.log("🏢 Matched Service Center:", serviceCenter);

        if (!serviceCenter) {
            console.warn("❌ No service center found for user_id:", userId);
            return res.status(404).json({ message: "Service Center not found" });
        }

        // Step 2: Get all pincodes operated by this center
        const operatedPincodes = await OperatingPincode.findAll({
            where: { center_id: serviceCenter.center_id },
            attributes: ['pincode']
        });
        console.log(operatedPincodes);
        const pincodeList = operatedPincodes.map(p => p.pincode);
        console.log("📍 Pincode List (Decrypted):", pincodeList);

        if (pincodeList.length === 0) {
            console.log("⚠️ No pincodes found for this service center.");
            return res.status(200).json({ complaints: [] });
        }

        // Step 3: Encrypt pincodes for querying
        const encryptedPincodeList = pincodeList.map(pin => encrypt(pin));
        console.log("🔐 Encrypted Pincodes for query:", encryptedPincodeList);
        const from = new Date(from_date + "T00:00:00.000Z");
        const to = new Date(to_date + "T23:59:59.999Z");
        console.log(from);
        console.log(to);
        // Step 4: Fetch complaints that match
        const complaints = await Complaint.findAll({
            where: {
                pincode: { [Op.in]: encryptedPincodeList },
                status: 'Unassigned',
                call_type: call_type,
                created_at: {
                    [Op.between]: [from, to]
                }
            }
        });
        console.log("🔍 Fetched complaints count:", complaints.length);

        // Step 5: Use getComplaintDetails for full enriched data
        const decryptedComplaints = await Promise.all(
            complaints.map(c => getComplaintDetails(c.complaint_id))
        );

        console.log("📝 Complaints fully processed:", decryptedComplaints.length);
        res.status(200).json({ complaints: decryptedComplaints });


    } catch (error) {
        console.error("❌ Error fetching unassigned complaints:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});

router.post('/getAssigned', async (req, res) => {
    try {
        console.log("📥 Request received for /getUnassigned");
        const userId = verifyToken(req);
        const { from_date, to_date, call_type} = req.body;
        console.log("🔍 Extracted Request Body:", { from_date, to_date, call_type, userId });

        if (!from_date || !to_date || !call_type || !userId) {
            console.warn("⚠️ Missing required parameters");
            return res.status(400).json({ message: "Missing from_date, to_date, call_type or userId" });
        }

        // Step 1: Find the logged-in service center
        const serviceCenter = await ServiceCenter.findOne({ where: { user_id: userId } });
        console.log("🏢 Matched Service Center:", serviceCenter);

        if (!serviceCenter) {
            console.warn("❌ No service center found for user_id:", userId);
            return res.status(404).json({ message: "Service Center not found" });
        }

        // Step 2: Get all pincodes operated by this center
        const operatedPincodes = await OperatingPincode.findAll({
            where: { center_id: serviceCenter.center_id },
            attributes: ['pincode']
        });
        console.log(operatedPincodes);
        const pincodeList = operatedPincodes.map(p => p.pincode);
        console.log("📍 Pincode List (Decrypted):", pincodeList);

        if (pincodeList.length === 0) {
            console.log("⚠️ No pincodes found for this service center.");
            return res.status(200).json({ complaints: [] });
        }

        // Step 3: Encrypt pincodes for querying
        const encryptedPincodeList = pincodeList.map(pin => encrypt(pin));
        console.log("🔐 Encrypted Pincodes for query:", encryptedPincodeList);
        const from = new Date(from_date + "T00:00:00.000Z");
        const to = new Date(to_date + "T23:59:59.999Z");
        console.log(from);
        console.log(to);
        // Step 4: Fetch complaints that match
        const complaints = await Complaint.findAll({
            where: {
                pincode: { [Op.in]: encryptedPincodeList },
                status: 'Assigned',
                call_type: call_type,
                created_at: {
                    [Op.between]: [from, to]
                }
            }
        });
        console.log("🔍 Fetched complaints count:", complaints.length);

        // Step 5: Use getComplaintDetails for full enriched data
        const decryptedComplaints = await Promise.all(
            complaints.map(c => getComplaintDetails(c.complaint_id))
        );

        console.log("📝 Complaints fully processed:", decryptedComplaints.length);
        res.status(200).json({ complaints: decryptedComplaints });


    } catch (error) {
        console.error("❌ Error fetching unassigned complaints:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});

router.post('/getPending', async (req, res) => {
    try {
        console.log("📥 Request received for /getUnassigned");
        const userId = verifyToken(req);
        const { from_date, to_date, call_type} = req.body;
        console.log("🔍 Extracted Request Body:", { from_date, to_date, call_type, userId });

        if (!from_date || !to_date || !call_type || !userId) {
            console.warn("⚠️ Missing required parameters");
            return res.status(400).json({ message: "Missing from_date, to_date, call_type or userId" });
        }

        // Step 1: Find the logged-in service center
        const serviceCenter = await ServiceCenter.findOne({ where: { user_id: userId } });
        console.log("🏢 Matched Service Center:", serviceCenter);

        if (!serviceCenter) {
            console.warn("❌ No service center found for user_id:", userId);
            return res.status(404).json({ message: "Service Center not found" });
        }

        // Step 2: Get all pincodes operated by this center
        const operatedPincodes = await OperatingPincode.findAll({
            where: { center_id: serviceCenter.center_id },
            attributes: ['pincode']
        });
        console.log(operatedPincodes);
        const pincodeList = operatedPincodes.map(p => p.pincode);
        console.log("📍 Pincode List (Decrypted):", pincodeList);

        if (pincodeList.length === 0) {
            console.log("⚠️ No pincodes found for this service center.");
            return res.status(200).json({ complaints: [] });
        }

        // Step 3: Encrypt pincodes for querying
        const encryptedPincodeList = pincodeList.map(pin => encrypt(pin));
        console.log("🔐 Encrypted Pincodes for query:", encryptedPincodeList);
        const from = new Date(from_date + "T00:00:00.000Z");
        const to = new Date(to_date + "T23:59:59.999Z");
        console.log(from);
        console.log(to);
        // Step 4: Fetch complaints that match
        const complaints = await Complaint.findAll({
            where: {
                pincode: { [Op.in]: encryptedPincodeList },
                status: 'Pending',
                call_type: call_type,
                created_at: {
                    [Op.between]: [from, to]
                }
            }
        });
        console.log("🔍 Fetched complaints count:", complaints.length);

        // Step 5: Use getComplaintDetails for full enriched data
        const decryptedComplaints = await Promise.all(
            complaints.map(c => getComplaintDetails(c.complaint_id))
        );

        console.log("📝 Complaints fully processed:", decryptedComplaints.length);
        res.status(200).json({ complaints: decryptedComplaints });


    } catch (error) {
        console.error("❌ Error fetching unassigned complaints:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});

router.post('/getCompleted', async (req, res) => {
    try {
        console.log("📥 Request received for /getUnassigned");
        const userId = verifyToken(req);
        const { from_date, to_date, call_type} = req.body;
        console.log("🔍 Extracted Request Body:", { from_date, to_date, call_type, userId });

        if (!from_date || !to_date || !call_type || !userId) {
            console.warn("⚠️ Missing required parameters");
            return res.status(400).json({ message: "Missing from_date, to_date, call_type or userId" });
        }

        // Step 1: Find the logged-in service center
        const serviceCenter = await ServiceCenter.findOne({ where: { user_id: userId } });
        console.log("🏢 Matched Service Center:", serviceCenter);

        if (!serviceCenter) {
            console.warn("❌ No service center found for user_id:", userId);
            return res.status(404).json({ message: "Service Center not found" });
        }

        // Step 2: Get all pincodes operated by this center
        const operatedPincodes = await OperatingPincode.findAll({
            where: { center_id: serviceCenter.center_id },
            attributes: ['pincode']
        });
        console.log(operatedPincodes);
        const pincodeList = operatedPincodes.map(p => p.pincode);
        console.log("📍 Pincode List (Decrypted):", pincodeList);

        if (pincodeList.length === 0) {
            console.log("⚠️ No pincodes found for this service center.");
            return res.status(200).json({ complaints: [] });
        }

        // Step 3: Encrypt pincodes for querying
        const encryptedPincodeList = pincodeList.map(pin => encrypt(pin));
        console.log("🔐 Encrypted Pincodes for query:", encryptedPincodeList);
        const from = new Date(from_date + "T00:00:00.000Z");
        const to = new Date(to_date + "T23:59:59.999Z");
        console.log(from);
        console.log(to);
        // Step 4: Fetch complaints that match
        const complaints = await Complaint.findAll({
            where: {
                pincode: { [Op.in]: encryptedPincodeList },
                status: 'Compeleted',
                call_type: call_type,
                created_at: {
                    [Op.between]: [from, to]
                }
            }
        });
        console.log("🔍 Fetched complaints count:", complaints.length);

        // Step 5: Use getComplaintDetails for full enriched data
        const decryptedComplaints = await Promise.all(
            complaints.map(c => getComplaintDetails(c.complaint_id))
        );

        console.log("📝 Complaints fully processed:", decryptedComplaints.length);
        res.status(200).json({ complaints: decryptedComplaints });


    } catch (error) {
        console.error("❌ Error fetching unassigned complaints:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});

router.post('/getCancelled', async (req, res) => {
    try {
        console.log("📥 Request received for /getUnassigned");
        const userId = verifyToken(req);
        const { from_date, to_date, call_type} = req.body;
        console.log("🔍 Extracted Request Body:", { from_date, to_date, call_type, userId });

        if (!from_date || !to_date || !call_type || !userId) {
            console.warn("⚠️ Missing required parameters");
            return res.status(400).json({ message: "Missing from_date, to_date, call_type or userId" });
        }

        // Step 1: Find the logged-in service center
        const serviceCenter = await ServiceCenter.findOne({ where: { user_id: userId } });
        console.log("🏢 Matched Service Center:", serviceCenter);

        if (!serviceCenter) {
            console.warn("❌ No service center found for user_id:", userId);
            return res.status(404).json({ message: "Service Center not found" });
        }

        // Step 2: Get all pincodes operated by this center
        const operatedPincodes = await OperatingPincode.findAll({
            where: { center_id: serviceCenter.center_id },
            attributes: ['pincode']
        });
        console.log(operatedPincodes);
        const pincodeList = operatedPincodes.map(p => p.pincode);
        console.log("📍 Pincode List (Decrypted):", pincodeList);

        if (pincodeList.length === 0) {
            console.log("⚠️ No pincodes found for this service center.");
            return res.status(200).json({ complaints: [] });
        }

        // Step 3: Encrypt pincodes for querying
        const encryptedPincodeList = pincodeList.map(pin => encrypt(pin));
        console.log("🔐 Encrypted Pincodes for query:", encryptedPincodeList);
        const from = new Date(from_date + "T00:00:00.000Z");
        const to = new Date(to_date + "T23:59:59.999Z");
        console.log(from);
        console.log(to);
        // Step 4: Fetch complaints that match
        const complaints = await Complaint.findAll({
            where: {
                pincode: { [Op.in]: encryptedPincodeList },
                status: 'Cancelled',
                call_type: call_type,
                created_at: {
                    [Op.between]: [from, to]
                }
            }
        });
        console.log("🔍 Fetched complaints count:", complaints.length);

        // Step 5: Use getComplaintDetails for full enriched data
        const decryptedComplaints = await Promise.all(
            complaints.map(c => getComplaintDetails(c.complaint_id))
        );

        console.log("📝 Complaints fully processed:", decryptedComplaints.length);
        res.status(200).json({ complaints: decryptedComplaints });


    } catch (error) {
        console.error("❌ Error fetching unassigned complaints:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});
module.exports = router;
