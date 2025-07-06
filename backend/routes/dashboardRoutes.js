const express = require("express");
const router = express.Router();
const { Complaint, ServiceCenter, OperatingPincode, User } = require('../models');
const { verifyToken } = require("../services/verifyToken");
const { Op, Sequelize } = require('sequelize');

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

        let customers = 0;
        let activeJobs = 0;
        let completedJobs = 0;
        let pendingJobs = 0;

        if (user.role.toLowerCase() === 'admin') {
            console.log('👑 Admin access: Fetching global stats...');

            customers = await Complaint.count({
                distinct: true,
                col: 'customer_request_id'
            });

            activeJobs = await Complaint.count({
                where: {
                    job_status: { [Op.in]: ['Assigned', 'Unassigned'] }
                }
            });

            completedJobs = await Complaint.count({
                where: { job_status: 'Completed' }
            });

            pendingJobs = await Complaint.count({
                where: { job_status: 'Pending' }
            });

        } else if (user.role.toLowerCase() === 'servicecenter') {
            console.log('🏢 Service Center access: Fetching scoped stats...');

            const center = await ServiceCenter.findOne({ where: { user_id } });
            if (!center) {
                console.warn('❌ Service center not found for user:', user_id);
                return res.status(404).json({ message: 'Service center not found' });
            }

            const operatedPincodes = await OperatingPincode.findAll({
                where: { center_id: center.center_id },
                attributes: ['pincode']
            });

            const pincodes = operatedPincodes.map(p => p.pincode);
            if (pincodes.length === 0) {
                console.log('⚠️ No operated pincodes found.');
                return res.json({ customers: 0, activeJobs: 0, completedJobs: 0, pendingJobs: 0 });
            }

            activeJobs = await Complaint.count({
                where: {
                    job_status: { [Op.in]: ['Assigned', 'Unassigned'] },
                    pincode: { [Op.in]: pincodes }
                }
            });

            completedJobs = await Complaint.count({
                where: {
                    job_status: 'Completed',
                    pincode: { [Op.in]: pincodes }
                }
            });

            pendingJobs = await Complaint.count({
                where: {
                    job_status: 'Pending',
                    pincode: { [Op.in]: pincodes }
                }
            });

            customers = await Complaint.count({
                where: { pincode: { [Op.in]: pincodes } },
                distinct: true,
                col: 'customer_request_id'
            });
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
