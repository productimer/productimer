import express, { urlencoded } from "express";
import path from "path";
import {Server }  from 'socket.io'
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";
import { request } from "express";
import fetch from 'node-fetch';
import http from 'http'
import bcrypt from "bcrypt"
import jwtDecode from "jwt-decode";



const app = express();
const server = http.createServer(app);
const io = new Server(server);


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
    sessions:Array,
    totalMinutes:Number
    

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


app.get("/home",async(req,res)=>{
    if(req.cookies.token){
        const quotePromise = getRandomQuote();
    
        const quoteValue = await quotePromise;
      const  quoteObj = JSON.parse(quoteValue)
       
    res.render("home.ejs",{quote:quoteObj[0].quote})
return;}
res.render("login.ejs",{message:"please login first!"});
})

app.get("/stats",async(req,res)=>{
  if(req.cookies.token){

    res.render('stats.ejs')
   
  }
  else{
    res.render("login.ejs",{message:"please login first!"});
  }

})

app.get("/api/stats",async(req,res)=>{

  const currentUser =await jwt.verify(req.cookies.token,'password') ;
  const userID = currentUser.id
  const currentUserData =  await Users.findOne({ _id: currentUser.id })
  
  res.json(currentUserData)


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
  //  console.log("currUser:",currUser)
   const token = jwt.sign({id:currUser.id},'password')
        // console.log("jwt token is:",token);
        res.cookie("token", token, {
            httpOnly: false,
            expires: new Date(Date.now() + 30000000)

        })
//    res.cookie('user',)
  res.redirect("/home")





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
      //  console.log("password is correct")
        const token = jwt.sign({id:currUser.id},'password')
        console.log("jwt token is:",token);
        res.cookie("token", token, {
            httpOnly: false,
            expires: new Date(Date.now() + 30000000)
// 
        })
        res.redirect("/home")
        return;
    }
    res.render("login.ejs",{message:"invalid password or email"})

})

app.post('/focus',async(req,res)=>{
  console.log(req.body);
  if(!req.cookies.token)
  {
      res.render("login.ejs",{message:"please login first"})
  }
  const currentUserID =await jwt.verify(req.cookies.token,'password') ;
  
  //we got the user id 
  //now we will insert the info
  try {
    
    const currentUser = await Users.updateOne({ _id: currentUserID.id }, {
        $push: {
            
            sessions:new Object(req.body)
        }
     })
    

} catch (error) {
    console.log(error)
}
res.redirect("/home")



})

app.post("/logout",(async(req,res)=>{
    try {
     
        await res.clearCookie("token")
    } catch (error) {
     console.log(error);
    }
    res.redirect("/login")
 
 }))



const decodeJWT = async(jwtID=0)=>{
  if(jwtID!=0){
    const currentUserID = await jwt.verify(jwtID,'password') ;
    return currentUserID.id;
  }
 
}

const rooms = {};

 connectDB().then(async() => {
    io.on("connection", (socket) => {
      console.log(socket.id);



     socket.on("planted",async(jwtID=0)=>{
      if(jwt!==0){
        try {
          const userID = await decodeJWT(jwtID)
        console.log(`tree is being planted by ${userID}`)
        } catch (error) {
          console.log(error)
        }
        
      }
     })



     socket.on("killed",async(jwtID=0)=>{
      if(jwt!==0){
        

          
        try {
          const userID = await decodeJWT(jwtID)
          console.log(`tree was killed by ${userID}`)
        } catch (error) {
          console.log(error)
        }
        
      }
      
     })

    

     socket.on("joinRoom",async(roomID,jwtID,callback)=>{
      const userIDObj = await jwtDecode(jwtID);
        const userID = userIDObj.id
      console.log(rooms[roomID]);



      if(rooms[roomID] && rooms[roomID].ownerPresent){
        console.log('owner already exists')
      }
      else if(rooms[roomID] && rooms[roomID].owner == userID){
        console.log("owner rejoined")
        socket.join(roomID);
        await callback(
           {message:`Successfully rejoined room ${roomID} as owner`,
             isOwner:true})
             return;
      }
      else{
        
        const ownerId =userID; // Use the client's unique identifier as the owner ID
        // Create the room
        rooms[roomID] = {
          owner: ownerId,
          clients: [ownerId],
          ownerPresent:true
        };
        console.log("new owner created")
        socket.join(roomID);
       await callback(
          {message:`Successfully joined room ${roomID} as owner`,
            isOwner:true})
            return;
      }
  
      
     

         
        
         //leave previous room
         
         socket.join(roomID);

        callback(
        {message:`Successfully joined room ${roomID}<br><small>*WAIT FOR THE OWNER TO START THE SESSION*</small>`,
          isOwner:false})
        
       //the arguement of callback is the message
        
       //status will be an object containing the session details like duration ,
       //plant status, etc
           
 
     })

     socket.on("client-status",(status,room)=>{
      const currRoom = rooms[room];
      console.log("currentRoom:",currRoom)
        

              console.log(status)
              socket.to(room).emit("receive-status",status);
          
  
 })

     socket.on('leave', async(room,jwtID) => {
      const userIDObj = await jwtDecode(jwtID);
      const userID = userIDObj.id
      console.log("inside leave function")
      console.log(room,userID);
      console.log(rooms[room]);
      if(rooms[room] && rooms[room].owner===userID){
       rooms[room].ownerPresent=false;
        console.log("OWNER LEFT THE ROOM")
      }

      socket.leave(room); // Leave the specified room
    
    });
    
    

     
  
      // Handle socket events here
    });



    if(process.env.NODE_ENV){
        server.listen(4400, () => {
            console.log("SERVER IS RUNNING");
          });
    }
    else{

        server.listen("https://productimer.onrender.com")
    }
  });

