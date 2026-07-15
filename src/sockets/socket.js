import { Server } from "socket.io";
import { registerdriverevent } from "./driver.socket.js";
import { registeruserevent } from "./user.socket.js";


let io;

export const initsocketserver=(server)=>{
    io=new Server(server,{
        cors:{origin:"*"},
    })
   io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    registerdriverevent(io,socket)
    registeruserevent(io,socket)
});
//  socket.on("disconnect", () => {
//         console.log("User Disconnected", socket.id);
//     });
}


export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
}; 