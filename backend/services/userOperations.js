const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signupUser = async (username, password) => {
  if (!username || !password) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
  }
  try {
    const normalizedEmail = username.toLowerCase();
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      normalizedEmail,
    ]);
    if (rows.length > 0) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    await db.execute("INSERT INTO users (email, password) VALUES (?, ?)", [
      normalizedEmail,
      hashedPassword,
    ]);
    return { message: "User registered successfully" };
  } catch (error) {
    throw error;
  }
};
const signinUser = async (username, password, isChecked) => {
  if (!username || !password) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
  }

  try {
    const normalizedEmail = username.toLowerCase();

    // Fetch user from DB
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      normalizedEmail,
    ]);

    if (rows.length === 0) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (rows.length > 1) {
      // This should ideally never happen if email is unique
      const error = new Error("Multiple users found with this email");
      error.statusCode = 409;
      throw error;
    }

    const user = rows[0];

    // Compare password with hashed password in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid password");
      error.statusCode = 401;
      throw error;
    }
    let token;
    if (!isChecked) {
      token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "15m" }
      );
      console.log("For shorter duration of time")
    } else {
       token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "24h" }
      );
      console.log("For longer duration of time")
    }

    return { message: "Signin successful", token };
  } catch (error) {
    throw error;
  }
};

module.exports = { signupUser, signinUser };
