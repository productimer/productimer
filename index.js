import express, { urlencoded } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'
import mongoose from "mongoose";

const app  = express();
app.use(express.static(path.join(path.resolve(), "public/styles")));


app.use(express.urlencoded({ extended: true }));
//with the above middleware we can parse urlencoded info and can
//access it with req.body


app.use(cookieParser());
// This middleware parses cookies attached to the incoming request.
// It takes the cookie data, decrypts it if necessary, and makes it available in the req.cookies object.



app.use(express.json());
// This middleware is responsible for parsing JSON data in the request body.
// It automatically parses the JSON data and makes it available in the req.body object.


app.set("view engine", "ejs");


dotenv.config();

//we use mongoose as a module to make use of MongoDB in nodejs

//defining temp userSchema for every user document
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    

})

const Users = mongoose.model("users", userSchema);

//function for connecting MongoDB...
const connectDB = async()=>{

    mongoose.set('strictQuery',false);
const conn =      await mongoose.connect(process.env.MONGO_URI, {
        dbName: "Productimer"
    }).then(() => console.log("database connected")).catch((e) => { console.log(e) })
}



//just to test if DB works
app.get("/createTestUser",(req,res)=>{

    const appuExists = Users.findOne({email:"appu@gmail.com"});
    //this will return null if document with email appu@gmail.com does not exist

    //if the doc exists it will return the entire document

    if(!appuExists){
        Users.create({
            name:"appu",
            email:"appu@gmail.com",
            password:"appu"
        }).then(()=>{
            res.send("user created!");
        }).catch((err)=>{
            console.log(err);
        })
    }
    else{
        res.send("appu already exists!");
    }
    
   
})





app.get("/",(req,res)=>{
    res.render("login.ejs")
})



connectDB().then(()=>{
    app.listen(4400,()=>{
        console.log("SERVER IS RUNNING")
    })  
})
