const express = require("express");
const router = express.Router();
const { Complaint, Customer, ServiceCenter, OperatingPincode, User } = require('../models');
const { verifyToken } = require("../services/verifyToken");
const { encrypt } = require("../utils/cryptoUtils"); // 🔐 Import your encryption function
const { Op } = require('sequelize');

router.get('/stats', async (req, res) => {
    try {
        console.log('📥 Incoming request to /dashboard/stats');

        const user_id = verifyToken(req);
        console.log(`🔐 Verified token. User ID: ${user_id}`);

        const user = await User.findByPk(user_id);
        if (!user) {
            console.warn('❌ User not found for ID:', user_id);
            return res.status(401).json({ message: 'Unauthorized' });
        }

        console.log(`👤 User role: ${user.role}`);

        let customers = 0, activeJobs = 0, completedJobs = 0, pendingJobs = 0;

        if (user.role === 'admin') {
            console.log('👑 Admin access: Fetching global stats...');

            customers = await Customer.count();
            console.log(`👥 Total customers: ${customers}`);

            activeJobs = await Complaint.count({ where: { status: ['Assigned', 'Unassigned'] } });
            console.log(`🔧 Active jobs: ${activeJobs}`);

            completedJobs = await Complaint.count({ where: { status: 'Completed' } });
            console.log(`✅ Completed jobs: ${completedJobs}`);

            pendingJobs = await Complaint.count({ where: { status: 'Pending' } });
            console.log(`⏳ Pending jobs: ${pendingJobs}`);

        } else if (user.role.toLowerCase() === 'servicecenter') {
            console.log('🏢 Service Center access: Fetching scoped stats...');

            const center = await ServiceCenter.findOne({ where: { user_id } });
            if (!center) {
                console.warn('❌ Service center not found for user:', user_id);
                return res.status(404).json({ message: 'Service center not found' });
            }

            console.log(`🏷️ Service Center ID: ${center.center_id}`);

            const operatedPincodes = await OperatingPincode.findAll({
                where: { center_id: center.center_id },
                attributes: ['pincode']
            });

            const plainPincodes = operatedPincodes.map(p => p.pincode);
            console.log(`📍 Operated pincodes (plain):`, plainPincodes);

            if (plainPincodes.length === 0) {
                console.log('⚠️ No operated pincodes found.');
                return res.json({ customers: 0, activeJobs: 0, completedJobs: 0, pendingJobs: 0 });
            }

            const encryptedPincodes = plainPincodes.map(pin => encrypt(pin));
            console.log(`🔒 Encrypted pincodes:`, encryptedPincodes);

            activeJobs = await Complaint.count({
                where: {
                    status: ['Assigned', 'Unassigned'],
                    pincode: { [Op.in]: encryptedPincodes }
                }
            });
            console.log(`🔧 Active jobs: ${activeJobs}`);

            completedJobs = await Complaint.count({
                where: {
                    status: 'Completed',
                    pincode: { [Op.in]: encryptedPincodes }
                }
            });
            console.log(`✅ Completed jobs: ${completedJobs}`);

            pendingJobs = await Complaint.count({
                where: {
                    status: 'Pending',
                    pincode: { [Op.in]: encryptedPincodes }
                }
            });
            console.log(`⏳ Pending jobs: ${pendingJobs}`);

            const complaints = await Complaint.findAll({
                where: { pincode: { [Op.in]: encryptedPincodes } },
                attributes: ['customer_id'],
                group: ['customer_id']
            });
            customers = complaints.length;
            console.log(`👥 Unique customers served: ${customers}`);

        } else {
            console.warn('❌ Access denied for role:', user.role);
            return res.status(403).json({ message: 'Access denied.' });
        }

        console.log('✅ Final dashboard stats:', { customers, activeJobs, completedJobs, pendingJobs });

        res.json({
            customers,
            activeJobs,
            completedJobs,
            pendingJobs
        });

    } catch (err) {
        console.error('❌ Error fetching stats:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
