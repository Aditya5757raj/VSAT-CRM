const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Sequelize setup
const { sequelize } = require("./models"); // <- Assuming models/index.js exports sequelize
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/jobRoutes");
const adminRoutes=require("./routes/adminRoutes")
const complaints=require("./routes/complaintRoutes");
const dashboardRoutes=require("./routes/dashboardRoutes");
const engineerRoutes=require("./routes/engineerRoutes");
const ccagentRoutes=require('./routes/ccagentRoutes');
const app = express();
app.set("trust proxy", 1);
const allowedOrigin = "http://127.0.0.1:5500";

// Middleware
app.use(cors({
  origin: '*', // ⚠️ Note: Credentials cannot be used with '*' origin
  credentials: false // Must be false if origin is '*'
}));
app.use(cookieParser());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// Routes
app.use("/auth", authRoutes);
app.use("/job", complaintRoutes);
app.use("/admin",adminRoutes);
app.use("/complain",complaints);
app.use("/dashboard",dashboardRoutes);
app.use("/engineer",engineerRoutes);
app.use("/ccagent",ccagentRoutes);

app.get("/", (req, res) => {
  res.send("Hello from server which Aditya is building");
});

// Sync Sequelize models and start the server
const PORT = process.env.PORT || 5000;
sequelize.sync({ alter: true }) // alter = adjusts DB to model
  .then(() => {
    console.log("✅ Sequelize models synced");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Sequelize sync failed:", err);
  });
