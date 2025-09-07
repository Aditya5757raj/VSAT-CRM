const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const axios = require('axios');
const { verifyToken } = require("../services/verifyToken");
const { sequelize, User,ServiceCenter, OperatingPincode } = require('../models');
const { signupUser, signinUser } = require('../services/userOperations');


router.post('/Signin', async (req, res) => {
  try {
    const { username, password, isChecked } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await signinUser(username, password, isChecked);

    console.log(result.message);
    console.log("Token:", result.token);
    console.log("Role:", result.role);

    // ✅ Return token, role, and firstLogin
    res.status(200).json({ 
      message: result.message, 
      token: result.token,
      role: result.role,
      firstLogin: result.firstLogin 
    });

  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

router.post("/change-password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = verifyToken(req); // 👈 Comes from token

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== oldPassword) {
      return res.status(401).json({ message: "Incorrect old password" });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from old password" });
    }

    // ✅ Update password and mark first login complete
    user.password = newPassword;
    user.firstLogin = false;
    await user.save();

    // ✅ Return success along with user role
    return res.status(200).json({
      message: "Password changed successfully",
      role: user.role
    });

  } catch (err) {
    console.error("Change Password Error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/validate", async (req, res) => {
  try {
    const userId = verifyToken(req);
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      valid: true,
      id: user.user_id,
      role: user.role,
      firstLogin: user.firstLogin
    });
  } catch (error) {
    return res.status(error.statusCode || 401).json({
      valid: false,
      message: error.message
    });
  }
});


module.exports = router;
