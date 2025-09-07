const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models"); // Sequelize User model

//adduser
const addUser = async (username, password, role) => {
  if (!username || !password || !role) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
  }

  try {
    const normalizedUsername = username.toLowerCase();

    // 🔍 Check if user already exists
    const existingUser = await User.findOne({ where: { username: normalizedUsername } });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }
    // ➕ Create user
    const user = await User.create({
      username: normalizedUsername,
      password: password,
      role
    });

    return {
      message: "✅ User registered successfully",
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role
      }
    };
  } catch (error) {
    throw error;
  }
};

// ✅ Get user info
const userInfo = async (email) => {
  if (!email) {
    const error = new Error("Email is required");
    error.statusCode = 400;
    throw error;
  }

  try {
    const user = await User.findOne({ where: { username: email.toLowerCase() } });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return { message: "User Details", user };
  } catch (error) {
    console.error("Database error:", error.message);
    throw error;
  }
};

// ✅ Signin user
const signinUser = async (username, password, isChecked) => {
  if (!username || !password) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
  }

  try {
    const normalizedUsername = username.toLowerCase();
    const user = await User.findOne({ where: { username: normalizedUsername } });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // 🔓 Plain text password comparison
    if (password !== user.password) {
      const error = new Error("Invalid password");
      error.statusCode = 401;
      throw error;
    }

    // 🪪 Generate JWT
    const expiresIn = isChecked ? 60 * 60 * 24 : 60 * 15; // seconds
    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET || "1234",
      { expiresIn }  // JWT expiry
    );

    // ⛳ Re-add this line
    const isFirstLogin = user.role !== "admin" && user.firstLogin;

    return {
      message: isFirstLogin
        ? "First login, password change required"
        : "Signin successful",
      token,
      role: user.role,
      firstLogin: isFirstLogin,
      expiresIn
    };

  } catch (error) {
    throw error;
  }
};


module.exports = { addUser, signinUser, userInfo };
