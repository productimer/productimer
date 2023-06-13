import express, { urlencoded } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";
import { request } from "express";
import fetch from 'node-fetch';
import bcrypt from "bcrypt"
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
// app.get("/createTestUser",async(req,res)=>{

//     const appuExists = await Users.findOne({email:"appu@gmail.com"});
//     //this will return null if document with email appu@gmail.com does not exist

//     //if the doc exists it will return the entire document

//     console.log(appuExists)
    
//       if(appuExists===null){
//         Users.create({
//             name:"appu",
//             email:"appu@gmail.com",
//             password:"appu"
//         }).then(()=>{
            
//             res.send("user created!");
//         }).catch((err)=>{
//             console.log(err);
//         })
//         return;
//       }else{
//         const a = Math.floor(Math.random()*10);
//         res.send(`appu exists ${a}`);

//       }
     

    
   
// })


const getRandomQuote=()=>{
    const category = 'success';
const apiKey = 'YOUR_API_KEY';

let quote;

return fetch(`https://api.api-ninjas.com/v1/quotes?category=${category}`, {
  headers: {
    'X-Api-Key': `8b6tIjLn1WZlmnISIEtdTw==Lemy59JlWuihfAjp`,
  },
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return response.text();
  })
  .then(body => {
   return( body);
  })
  .catch(error => {
    console.error('Request failed:', error);
  });

 
}


app.get("/",async(req,res)=>{
    if(!req.cookies.token){
        const quotePromise = getRandomQuote();
    
     const quoteValue = await quotePromise;
   const  quoteObj = JSON.parse(quoteValue)
        res.render("login.ejs",{message:quoteObj[0].quote})
    }
    else{
        res.redirect('/home');
    }
})

app.get("/register",async(req,res)=>{
    const quotePromise = getRandomQuote();
    
    const quoteValue = await quotePromise;
  const  quoteObj = JSON.parse(quoteValue)
   res.render("register.ejs",{message:quoteObj[0].quote});
})


app.get("/login",async(req,res)=>{
    const quotePromise = getRandomQuote();
    
     const quoteValue = await quotePromise;
   const  quoteObj = JSON.parse(quoteValue)
    res.render("login.ejs",{message:quoteObj[0].quote});
})


app.get("/home",(req,res)=>{
    if(req.cookies.token){
    res.render("home.ejs")
return;}
res.render("login.ejs",{message:"please login first!"});
})

app.post('/register',async(req,res)=>{
    console.log(req.body);
    const {email} = req.body
    const checkPreExistence = await Users.findOne({email:email});
   if(checkPreExistence){
    res.render("login.ejs",{message:"Account already exists!!! \nPlease Login Here"})
    return;
   }

   const encryptedPassword = await bcrypt.hash(req.body.password,10);
   console.log(encryptedPassword);

   await Users.create({
    email:req.body.email,
    password:encryptedPassword,
   })


//    creating cookie with encrypted object id
   const currUser = await Users.findOne({email:req.body.email})
   console.log("currUser:",currUser)
   const token = jwt.sign({id:currUser.id},'password')
        // console.log("jwt token is:",token);
        res.cookie("token", token, {
            httpOnly: true,
            expires: new Date(Date.now() + 30000000)

        })
//    res.cookie('user',)
   res.render("home.ejs")





})




app.post("/login",async(req,res)=>{
    // console.log(req.body);
    const {email,password} = req.body;
    const currUser = await Users.findOne({email:email});
    console.log("currUser",currUser);

    if(!currUser){
        res.render("register.ejs",{message:'account does not exist, please register here'})
        return;
    }
    //if entered password is correct then create a cookie for the user and take him to 
    //home page

   
    if (await bcrypt.compare(password, currUser.password)) {
       console.log("password is correct")
        const token = jwt.sign({id:currUser.id},'password')
        console.log("jwt token is:",token);
        res.cookie("token", token, {
            httpOnly: false,
            expires: new Date(Date.now() + 30000000)
// 
        })
        res.render("home.ejs");
        return;
    }
    res.render("login.ejs",{message:"invalid password or email"})

})

connectDB().then(()=>{
    app.listen(4400,()=>{
        console.log("SERVER IS RUNNING")
    })  
})
