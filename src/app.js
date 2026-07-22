import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";



const app=express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("Public"));
app.use(cookieParser());


import userRoute from "./routes/User/user.route.js"
import driverRoute from "./routes/Driver/driver.route.js"
import vechileRoute from "./routes/Vechile/vechile.route.js"
import rideRoute from "./routes/Ride/ride.route.js"



app.use("/api/v1/users",userRoute)
app.use("/api/v1/drivers",driverRoute)
app.use("/api/v1/vechile",vechileRoute)
app.use("/api/v1/ride",rideRoute)




export {app}
