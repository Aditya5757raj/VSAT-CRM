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
const partRequestRoutes = require('./routes/partRequestRoutes');
const app = express();
app.set("trust proxy", 1);
const allowedOrigins = [
  "https://vsat-crm-production.up.railway.app/",
  "https://vsat-crm.onrender.com", // production
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5501",
  "http://127.0.0.1:5501"
];
// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true // Must be false if origin is '*'
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
app.use('/warehouse', partRequestRoutes);

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
