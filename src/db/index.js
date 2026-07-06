import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import dotenv from "dotenv";



dotenv.config({ path: "./.env" });


const Connectdb=async ()=>{
    try{
        
    const connectioninstance =await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log("mongo db connected", connectioninstance.connection.host);

    }catch(err){
        console.log("Error connecting to MongoDB:", err);

    }
}


export default Connectdb;