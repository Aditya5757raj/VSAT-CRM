const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const axios = require('axios');
const { signupUser, signinUser } = require('../services/userOperations');
const signupLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: "Too many accounts created. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});


router.post('/Signup', signupLimiter, async (req, res) => {
  try {
    const { username, password, captcha } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!captcha) {
      return res.status(400).json({ error: "Captcha token is required" });
    }

    // Verify captcha
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    console.log(secretKey);
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;

    const response = await axios.post(verificationURL);
    const data = response.data;

    if (!data.success) {
      return res.status(403).json({ error: "Captcha verification failed" });
    }

    // Proceed with signup after successful captcha verification
    const result = await signupUser(username, password);

    res.status(201).json({ message: result.message });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});


router.post('/Signin', async (req, res) => {
  try {
    const { username, password,isChecked} = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const result = await signinUser(username, password,isChecked);
    console.log(result.message);
    console.log(result.token)
    res.status(200).json({ message: result.message, token: result.token });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

module.exports = router;
