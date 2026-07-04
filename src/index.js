import {app} from "./app.js";
import http from "http";
import dotenv from "dotenv";
import Connectdb from "./db/index.js";


dotenv.config({ path: "./.env" });
const result = dotenv.config();






const server=http.createServer(app);

Connectdb().then(()=>{
    server.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
       
      
    })
}).catch((err)=>{
    console.log("Error connecting to MongoDB:", err);
    process.exit(1); // Exit the process with an error code
}
)
