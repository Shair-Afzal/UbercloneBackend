import { Driver } from "../models/Driver/Driver.model.js";

export const registerdriverevent=(io,socket)=>{
    socket.on("join-driver",async (data)=>{
        try{
            const {userId}=data;
             console.log("Driver Registered:", userId);
            console.log("Socket ID:", socket.id);
            socket.join("drivers");
            socket.join(userId.toString());
            const driver=await Driver.findOneAndUpdate({userId:userId},{
                isOnline:true
            },{new:true})
            if (!driver) {
    console.log("Driver not found");
    return;
}
            socket.data.userId=userId
            io.emit("driver-online",userId)

            

        }catch(err){
            console.log("error is this ",err)
         
        }
    })

    socket.on("disconnect",async()=>{
                try{
                if(socket.data.userId){
                
                await Driver.findOneAndUpdate(
                    {
                    userId:socket.data.userId
                        
                    },
                    {
                        isOnline:false
                    },
                    {new:true}
                )
                 console.log("Driver Offline");
                }
                console.log("disconect",socket.id)

                }catch(err){
                    console.log("error in socket ",err)

                }

            }
                
            )


            socket.on("driver-location",async(data)=>{

                try{
                 const {userId,currentLocation}=data;

                 console.log("user location",userId,currentLocation)
        
                 const driver=await Driver.findOneAndUpdate({userId:userId},{
                    currentLocation:currentLocation
                 },{new:true})
                      if (!driver) {
    console.log("Driver not found");
    return;
}
                 socket.data.userId=userId;
                 socket.data.currentLocation=currentLocation
                 io.emit("driver-location", {
    userId,
    currentLocation
});
                }catch(err){
                    console.log(err)

                }

            })
}