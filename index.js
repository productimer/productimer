import express, { urlencoded } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'
import mongoose from "mongoose";
import Snackbar from "node-snackbar";

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
app.get("/createTestUser",async(req,res)=>{

    const appuExists = await Users.findOne({email:"appu@gmail.com"});
    //this will return null if document with email appu@gmail.com does not exist

    //if the doc exists it will return the entire document

    console.log(appuExists)
    
      if(appuExists===null){
        Users.create({
            name:"appu",
            email:"appu@gmail.com",
            password:"appu"
        }).then(()=>{
            
            res.send("user created!");
        }).catch((err)=>{
            console.log(err);
        })
        return;
      }else{
        const a = Math.floor(Math.random()*10);
        res.send(`appu exists ${a}`);

      }
     

    
   
})





app.get("/",(req,res)=>{
    if(!req.cookies.token){
        res.render("login.ejs")
    }
    else{
        res.redirect('/home');
    }
})

app.get("/register",(req,res)=>{
    res.render("register.ejs");
})
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})


app.get("/home",(req,res)=>{
    res.render("home.ejs")
})

app.post('/register',async(req,res)=>{
    console.log(req.body);
    const {email} = req.body
    const checkPreExistence = await Users.findOne({email:email});
   



})




app.post("/login",(req,res)=>{
    console.log(req.body);
})

connectDB().then(()=>{
    app.listen(4400,()=>{
        console.log("SERVER IS RUNNING")
    })  
})
