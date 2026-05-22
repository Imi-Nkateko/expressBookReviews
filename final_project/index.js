const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
   const authHeader = req.headers.authorization;

   if (!authHeader) {
     return res.status(401).json({ message: "No access token provided" });
   }

   // Extract the token from "Bearer <token>" format
   const token = authHeader.split(" ")[1];

   if (!token) {
     return res.status(401).json({ message: "Invalid token format" });
   }

   // Check if session exists for this token
   if (!req.session.authorization || !req.session.authorization.accessToken) {
     return res.status(401).json({ message: "No active session found" });
   }

   // Verify the token matches the session token
   if (req.session.authorization.accessToken !== token) {
     return res.status(403).json({ message: "Invalid access token" });
   }

   // If we get here, authentication is successful
   // Attach user info to request for downstream handlers
   if (req.session.authorization.user) {
     req.user = req.session.authorization.user;
   }

   // Proceed to the next middleware/route handler
   next();
});
 
const PORT =8800;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
