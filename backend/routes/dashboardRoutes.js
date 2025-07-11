const express = require("express");
const router = express.Router();
const { Complaint, ServiceCenter, OperatingPincode, User } = require('../models');
const { Parser } = require('json2csv');
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
const fields = [
  'complaint_id',
  'request_type',
  'root_request_id',
  'customer_request_id',
  'ecom_order_id',
  'product_type',
  'call_priority',
  'req_creation_date',
  'booking_date',
  'booking_time',
  'customer_name',
  'city',
  'pincode',
  'mobile_number',
  'address',
  'estimated_product_delivery_date',
  'issue_type',
  'product_name',
  'symptoms',
  'model_no',
  'serial_number',
  'brand',
  'date_of_purchase',
  'warranty',
  'final_Customer_partner_alignment_Date',
  'Pre_job_connect_with_Cx',
  'Final_Time_slot_committed_with_Cx_Px',
  'technician_availability',
  'job_status',
  'Unproductive_visit_if_any',
  'partner_name',
  'job_end_date',
  'OGM_Status',
  'rescheduled_date',
  'reason_for_rescheduling',
  'remark_for_rescheduling',
  'reason_for_cancelled',
  'remark_for_cancelled',
  'rf_module_installation_status',
  'reason_for_rf_not_installed',
  'remark_for_rf_not_installed',
  'configuration_done',
  'wifi_connected',
  'sme_Remark',
  'remark_for_extra_mile',
  'az_rating',
  'photo_proof_of_installed_RF_Module',
  'video_proof_of_installed_lock_open',
  'video_of_bell_notification_coming',
  'other_remark_if_any',
  'service_partner',
  'updated_at'
];

router.get('/downloadComplaints', async (req, res) => {
  try {
    const { filter } = req.query;
    const { Op } = require('sequelize');
    let whereClause = {};

    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      whereClause.req_creation_date = {
        [Op.gte]: today,
        [Op.lt]: tomorrow,
      };
    }

    const complaints = await Complaint.findAll({ where: whereClause });
    const jsonData = complaints.map(c => c.toJSON());

    const parser = new Parser({ fields });
    const csv = parser.parse(jsonData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`complaints_${filter || 'all'}.csv`);
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating CSV');
  }
});
router.post('/downloadFilteredComplaints', async (req, res) => {
  try {
    console.log('📥 Incoming request to downloadFilteredComplaints');
    console.log(req.body);
    const { fromDate, toDate, reportType } = req.body;
    console.log(`🗓️ From Date: ${fromDate}, To Date: ${toDate}, Report Type: ${reportType}`);

    if (!fromDate || !toDate || !reportType) {
      console.warn('⚠️ Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Define status filters based on report type
    let statusFilter = null;
    switch (reportType.toLowerCase()) {
      case 'pending':
        statusFilter = ['Unassigned', 'Assigned', 'Pending'];
        break;
      case 'ok':
        statusFilter = ['Completed'];
        break;
      case 'cancelled':
        statusFilter = ['Cancelled'];
        break;
      case 'registered':
        statusFilter = null;
        break;
      default:
        console.warn(`⚠️ Invalid report type: ${reportType}`);
        return res.status(400).json({ message: 'Invalid report type' });
    }

    // Build query
    const whereClause = {
      req_creation_date: {
        [Op.between]: [new Date(fromDate), new Date(toDate)],
      },
    };

    if (statusFilter) {
      whereClause.job_status = {
        [Op.or]: statusFilter,
      };
    }

    console.log('🔍 Querying database with whereClause:', JSON.stringify(whereClause, null, 2));
    const complaints = await Complaint.findAll({ where: whereClause });

    console.log(`📊 Found ${complaints.length} complaints`);
    if (complaints.length === 0) {
      console.warn('⚠️ No complaints found for the selected criteria');
      return res.status(404).json({ message: 'No complaints found for the selected criteria' });
    }

    const complaintsData = complaints.map((c, i) => {
      const data = c.toJSON();
      console.log(`✅ Complaint ${i + 1}:`, data.complaint_id);
      return data;
    });

    const json2csv = new Parser();
    const csv = json2csv.parse(complaintsData);

    const filename = `${reportType}_complaints_${fromDate}_to_${toDate}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/csv');
    
    console.log('📤 Sending CSV report:', filename);
    res.send(csv);
  } catch (err) {
    console.error('❌ Report download failed:', err);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});
router.get("/userinfo", async (req, res) => {
    try {
        const user_id = verifyToken(req); // Should throw error if invalid
        console.log(`🔐 Verified token. User ID: ${user_id}`);

        const user = await User.findByPk(user_id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate initials from user.name
        const getInitials = (name) => {
            if (!name) return "--";
            const parts = name.trim().split(" ");
            if (parts.length === 1) return parts[0][0].toUpperCase();
            return (parts[0][0] + parts[1][0]).toUpperCase();
        };

        const initials = getInitials(user.username);

        res.json({
            name: user.username || "N/A",
            role: user.role || "User",
            initials: initials || "--"
        });

    } catch (error) {
        console.error("❌ Error in /userinfo:", error.message);
        res.status(401).json({ message: "Unauthorized" });
    }
});


module.exports = router;
