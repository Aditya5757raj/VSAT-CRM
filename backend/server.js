const express=require("express");
const bodyparser=require("body-parser");
const cors=require("cors");
require("dotenv").config();
const db=require("./config/db")
const authRoutes = require("./routes/authRoutes");
const app=express();
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}))
const PORT=process.env.PORT;


app.use("/auth", authRoutes);
app.get('/',(req,res)=>{
    res.send("Hello form server which aditya is building")
})

app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
})