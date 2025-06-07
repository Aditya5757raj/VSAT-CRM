const express=require("express");
const bodyparser=require("body-parser");
const cors=require("cors");
const cookieParser = require('cookie-parser');
require("dotenv").config();
const db=require("./config/db")
const authRoutes = require("./routes/authRoutes");
const complaintRoutes=require("./routes/jobRoutes");
const app=express();
app.set('trust proxy', 1);
const allowedOrigin = 'http://127.0.0.1:5500';

app.use(cors({
  origin: allowedOrigin,
  credentials: true,  // Allow cookies and credentials
}));

app.use(cookieParser());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}))
const PORT=process.env.PORT;


app.use("/auth", authRoutes);
app.use("/job",complaintRoutes);
app.get('/',(req,res)=>{
    res.send("Hello form server which aditya is building")
})

app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
})