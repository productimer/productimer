import express, { urlencoded } from "express";
import path from "path";

const app  = express();
app.use(express.static(path.join(path.resolve(), "public/styles")));
app.set("view engine", "ejs");


app.get("/",(req,res)=>{
    res.render("login.ejs")
})




app.listen(4400,()=>{
    console.log("SERVER IS RUNNING")
})