const express = require('express');
const router = express.Router();
const { sequelize, User,ServiceCenter, OperatingPincode,CcAgent } = require('../models');
const { registerServiceCenter } = require("../services/serviceCenter");
const { verifyToken } = require("../services/verifyToken")

router.get('/brands', async (req, res) => {
  console.log('🔄 [GET /ccagent/brands] Route called');

  try {
    const userId = verifyToken(req);
    console.log('🔐 Token verified. Extracted userId:', userId);

    if (!userId) {
      console.warn('⚠️ Missing or invalid userId from token');
      return res.status(400).json({ message: "Missing userId" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      console.warn('❌ User not found in DB for userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('👤 Authenticated User:', {
      user_id: user.user_id,
      email: user.email,
      role: user.role
    });

    const role = user.role.toLowerCase();

    if (role === 'ccagent') {
      console.log('🛠️ User is CC Agent. Fetching agent data using user_id:', user.user_id);

      const ccAgent = await CcAgent.findOne({ where: { user_id: user.user_id } });

      if (!ccAgent) {
        console.warn('⚠️ No CC Agent profile found for user_id:', user.user_id);
        return res.json({ brands: [] });
      }

      console.log('📦 Fetched CC Agent record:', ccAgent.toJSON());

      if (!ccAgent.brands || !Array.isArray(ccAgent.brands)) {
        console.warn('⚠️ No valid brands array found for CC Agent');
        return res.json({ brands: [] });
      }

      console.log(`✅ Returning ${ccAgent.brands.length} assigned brand(s) for CC Agent`);
      return res.json({ brands: ccAgent.brands });

    } else if (role === 'admin') {
      const allBrands = ['Urban Company', 'Wipro', 'VSAT'];
      console.log('👑 User is Admin. Returning all brands:', allBrands);
      return res.json({ brands: allBrands });

    } else {
      console.warn('⛔ Access denied. User is not CC Agent or Admin.');
      return res.status(403).json({ message: 'Access denied' });
    }
  } catch (err) {
    console.error('🔥 Failed to fetch brands due to error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;