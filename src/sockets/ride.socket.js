import { Ride } from "../models/Ride/Ride.model";



export const registerrideevent=(io,socket)=>{
    socket.on("request-ride",async (data)=>{
        try{
            const {userId,pickupLocation}=data

            socket.join(userId.toString())
            


        }catch(err){

        }

    })

}