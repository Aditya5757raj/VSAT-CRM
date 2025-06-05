const express = require("express");
const router = express.Router();
const { signupUser, signinUser } = require('../services/userOperations');

router.post('/Signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const result = await signupUser(username, password);
    res.status(201).json({ message: result.message});
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
