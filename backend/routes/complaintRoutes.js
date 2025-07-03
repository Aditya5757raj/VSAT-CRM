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
        const { from_date, to_date, call_type } = req.body;
        console.log("🔍 Extracted Request Body:", { from_date, to_date, call_type, userId });

        if (!userId) {
            console.warn("⚠️ Missing userId");
            return res.status(400).json({ message: "Missing userId" });
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

        const pincodeList = operatedPincodes.map(p => p.pincode);
        console.log("📍 Pincode List (Decrypted):", pincodeList);

        if (pincodeList.length === 0) {
            console.log("⚠️ No pincodes found for this service center.");
            return res.status(200).json({ complaints: [] });
        }

        // Step 3: Encrypt pincodes for querying
        const encryptedPincodeList = pincodeList.map(pin => encrypt(pin));
        console.log("🔐 Encrypted Pincodes for query:", encryptedPincodeList);

        // Step 4: Construct dynamic where clause
        const complaintWhere = {
            pincode: { [Op.in]: encryptedPincodeList },
            status: 'Unassigned',
        };

        // Only add filters if values are provided
        if (from_date && to_date && call_type) {
            complaintWhere.call_type = call_type;
            complaintWhere.created_at = {
                [Op.between]: [
                    new Date(from_date + "T00:00:00.000Z"),
                    new Date(to_date + "T23:59:59.999Z")
                ]
            };
            console.log("🧭 Date and type filtering enabled.");
        } else {
            console.log("📄 No date/type filter applied. Fetching all unassigned complaints by pincode.");
        }

        // Step 5: Fetch complaints
        const complaints = await Complaint.findAll({ where: complaintWhere });
        console.log("🔍 Fetched complaints count:", complaints.length);

        // Step 6: Enrich data
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
        console.log("📥 Request received for /getAssigned");
        const userId = verifyToken(req);
        const { from_date, to_date, call_type } = req.body;
        console.log("🔍 Extracted Request Body:", { from_date, to_date, call_type, userId });

        if (!userId) {
            console.warn("⚠️ Missing userId");
            return res.status(400).json({ message: "Missing userId" });
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

        const pincodeList = operatedPincodes.map(p => p.pincode);
        console.log("📍 Pincode List (Decrypted):", pincodeList);

        if (pincodeList.length === 0) {
            console.log("⚠️ No pincodes found for this service center.");
            return res.status(200).json({ complaints: [] });
        }

        // Step 3: Encrypt pincodes for querying
        const encryptedPincodeList = pincodeList.map(pin => encrypt(pin));
        console.log("🔐 Encrypted Pincodes for query:", encryptedPincodeList);

        // Step 4: Construct dynamic where clause
        const complaintWhere = {
            pincode: { [Op.in]: encryptedPincodeList },
            status: 'Assigned',
        };

        if (from_date && to_date && call_type) {
            complaintWhere.call_type = call_type;
            complaintWhere.created_at = {
                [Op.between]: [
                    new Date(from_date + "T00:00:00.000Z"),
                    new Date(to_date + "T23:59:59.999Z")
                ]
            };
            console.log("🧭 Date and type filtering enabled.");
        } else {
            console.log("📄 No date/type filter applied. Fetching all assigned complaints by pincode.");
        }

        // Step 5: Fetch complaints
        const complaints = await Complaint.findAll({ where: complaintWhere });
        console.log("🔍 Fetched complaints count:", complaints.length);

        // Step 6: Enrich data
        const decryptedComplaints = await Promise.all(
            complaints.map(c => getComplaintDetails(c.complaint_id))
        );

        console.log("📝 Complaints fully processed:", decryptedComplaints.length);
        res.status(200).json({ complaints: decryptedComplaints });

    } catch (error) {
        console.error("❌ Error fetching assigned complaints:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});

router.post('/getPending', async (req, res) => {
    try {
        console.log("📥 Request received for /getPending");
        const userId = verifyToken(req);
        const { from_date, to_date, call_type } = req.body;
        console.log("🔍 Extracted Request Body:", { from_date, to_date, call_type, userId });

        if (!userId) {
            console.warn("⚠️ Missing userId");
            return res.status(400).json({ message: "Missing userId" });
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

        const pincodeList = operatedPincodes.map(p => p.pincode);
        console.log("📍 Pincode List (Decrypted):", pincodeList);

        if (pincodeList.length === 0) {
            console.log("⚠️ No pincodes found for this service center.");
            return res.status(200).json({ complaints: [] });
        }

        // Step 3: Encrypt pincodes
        const encryptedPincodeList = pincodeList.map(pin => encrypt(pin));
        console.log("🔐 Encrypted Pincodes for query:", encryptedPincodeList);

        // Step 4: Build where clause
        const complaintWhere = {
            pincode: { [Op.in]: encryptedPincodeList },
            status: 'Pending',
        };

        if (from_date && to_date && call_type) {
            complaintWhere.call_type = call_type;
            complaintWhere.created_at = {
                [Op.between]: [
                    new Date(from_date + "T00:00:00.000Z"),
                    new Date(to_date + "T23:59:59.999Z")
                ]
            };
            console.log("🧭 Date and type filtering enabled.");
        } else {
            console.log("📄 No date/type filter applied. Fetching all pending complaints by pincode.");
        }

        // Step 5: Fetch complaints
        const complaints = await Complaint.findAll({ where: complaintWhere });
        console.log("🔍 Fetched complaints count:", complaints.length);

        // Step 6: Enrich data
        const decryptedComplaints = await Promise.all(
            complaints.map(c => getComplaintDetails(c.complaint_id))
        );

        console.log("📝 Complaints fully processed:", decryptedComplaints.length);
        res.status(200).json({ complaints: decryptedComplaints });

    } catch (error) {
        console.error("❌ Error fetching pending complaints:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});


router.post('/getCompleted', async (req, res) => {
    try {
        console.log("📥 Request received for /getCompleted");
        const userId = verifyToken(req);
        const { from_date, to_date, call_type } = req.body;
        console.log("🔍 Extracted Request Body:", { from_date, to_date, call_type, userId });

        if (!userId) {
            console.warn("⚠️ Missing userId");
            return res.status(400).json({ message: "Missing userId" });
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

        const pincodeList = operatedPincodes.map(p => p.pincode);
        console.log("📍 Pincode List (Decrypted):", pincodeList);

        if (pincodeList.length === 0) {
            console.log("⚠️ No pincodes found for this service center.");
            return res.status(200).json({ complaints: [] });
        }

        // Step 3: Encrypt pincodes
        const encryptedPincodeList = pincodeList.map(pin => encrypt(pin));
        console.log("🔐 Encrypted Pincodes for query:", encryptedPincodeList);

        // Step 4: Build where clause
        const complaintWhere = {
            pincode: { [Op.in]: encryptedPincodeList },
            status: 'Completed', // ✅ Fixed spelling
        };

        if (from_date && to_date && call_type) {
            complaintWhere.call_type = call_type;
            complaintWhere.created_at = {
                [Op.between]: [
                    new Date(from_date + "T00:00:00.000Z"),
                    new Date(to_date + "T23:59:59.999Z")
                ]
            };
            console.log("🧭 Date and type filtering enabled.");
        } else {
            console.log("📄 No date/type filter applied. Fetching all completed complaints by pincode.");
        }

        // Step 5: Fetch complaints
        const complaints = await Complaint.findAll({ where: complaintWhere });
        console.log("🔍 Fetched complaints count:", complaints.length);

        // Step 6: Enrich complaint data
        const decryptedComplaints = await Promise.all(
            complaints.map(c => getComplaintDetails(c.complaint_id))
        );

        console.log("📝 Complaints fully processed:", decryptedComplaints.length);
        res.status(200).json({ complaints: decryptedComplaints });

    } catch (error) {
        console.error("❌ Error fetching completed complaints:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});


router.post('/getCancelled', async (req, res) => {
    try {
        console.log("📥 Request received for /getCancelled");
        const userId = verifyToken(req);
        const { from_date, to_date, call_type } = req.body;
        console.log("🔍 Extracted Request Body:", { from_date, to_date, call_type, userId });

        if (!userId) {
            console.warn("⚠️ Missing userId");
            return res.status(400).json({ message: "Missing userId" });
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

        const pincodeList = operatedPincodes.map(p => p.pincode);
        console.log("📍 Pincode List (Decrypted):", pincodeList);

        if (pincodeList.length === 0) {
            console.log("⚠️ No pincodes found for this service center.");
            return res.status(200).json({ complaints: [] });
        }

        // Step 3: Encrypt pincodes for querying
        const encryptedPincodeList = pincodeList.map(pin => encrypt(pin));
        console.log("🔐 Encrypted Pincodes for query:", encryptedPincodeList);

        // Step 4: Build dynamic where clause
        const complaintWhere = {
            pincode: { [Op.in]: encryptedPincodeList },
            status: 'Cancelled',
        };

        if (from_date && to_date && call_type) {
            complaintWhere.call_type = call_type;
            complaintWhere.created_at = {
                [Op.between]: [
                    new Date(from_date + "T00:00:00.000Z"),
                    new Date(to_date + "T23:59:59.999Z")
                ]
            };
            console.log("🧭 Date and type filtering enabled.");
        } else {
            console.log("📄 No date/type filter applied. Fetching all cancelled complaints by pincode.");
        }

        // Step 5: Fetch complaints
        const complaints = await Complaint.findAll({ where: complaintWhere });
        console.log("🔍 Fetched complaints count:", complaints.length);

        // Step 6: Use getComplaintDetails for full enriched data
        const decryptedComplaints = await Promise.all(
            complaints.map(c => getComplaintDetails(c.complaint_id))
        );

        console.log("📝 Complaints fully processed:", decryptedComplaints.length);
        res.status(200).json({ complaints: decryptedComplaints });

    } catch (error) {
        console.error("❌ Error fetching cancelled complaints:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});

module.exports = router;
