import ApiError from "../../utils/ApiError.js";
import { Ride } from "../../models/Ride/Ride.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asynchandler from "../../utils/asynchandler.js";
import { getIO } from "../../sockets/socket.js";

const createriderequest = asynchandler(async (req, resp) => {

    const {
        pickupLocation,
        destination,
        pickupCoordinates,
        destinationCoordinates,
        distance,
        duration,
        fare,
        rideType,
        paymentMethod
    } = req.body;

    if (
        !pickupLocation ||
        !destination ||
        !pickupCoordinates ||
        !destinationCoordinates ||
        !distance ||
        !duration ||
        !fare ||
        !rideType ||
        !paymentMethod
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const ride = await Ride.create({

        userId: req.user._id,

        pickupLocation,
        destination,

        pickupCoordinates,
        destinationCoordinates,

        distance,
        duration,

        fare,

        rideType,
        paymentMethod,

        rideStatus: "requested"

    });

    if (!ride) {
        throw new ApiError(500, "Error while creating ride");
    }

    const io = getIO();

   
    io.to("driver-online").emit("new-ride-request", ride);

    return resp.status(201).json(
        new ApiResponse(
            201,
            ride,
            "Ride request created successfully"
        )
    );

});



const acceptRide = asynchandler(async (req, resp) => {

    const { rideId } = req.body;

    if (!rideId) {
        throw new ApiError(400, "Ride Id is required");
    }

   
    const existingRide = await Ride.findById(rideId);

    if (!existingRide) {
        throw new ApiError(404, "Ride not found");
    }

    if (existingRide.rideStatus !== "requested") {
        throw new ApiError(400, "Ride is already accepted or completed");
    }

    if (existingRide.driverId) {
        throw new ApiError(400, "Ride already assigned");
    }

    const ride = await Ride.findByIdAndUpdate(
        rideId,
        {
            driverId: req.user._id, 
            rideStatus: "accepted"
        },
        { new: true }
    );

    if (!ride) {
        throw new ApiError(500, "Error while accepting ride");
    }

    const io = getIO();

    io.to(ride.userId.toString()).emit(
        "ride-accepted",
        ride
    );

    return resp.status(200).json(
        new ApiResponse(
            200,
            ride,
            "Driver accepted the ride"
        )
    );

});



const cancelRide = asynchandler(async (req, resp) => {

    const { rideId } = req.body;

    if (!rideId) {
        throw new ApiError(400, "Ride Id is required");
    }

   
    const existingRide = await Ride.findById(rideId);

    if (!existingRide) {
        throw new ApiError(404, "Ride not found");
    }

    if (
        existingRide.rideStatus === "completed" ||
        existingRide.rideStatus === "cancelled"
    ) {
        throw new ApiError(
            400,
            "Ride cannot be cancelled"
        );
    }

    const ridecancel = await Ride.findByIdAndUpdate(
        rideId,
        {
            rideStatus: "cancelled"
        },
        { new: true }
    );

    if (!ridecancel) {
        throw new ApiError(
            500,
            "Error while cancelling ride"
        );
    }

    const io = getIO();

    io.to(ridecancel.userId.toString()).emit(
        "ride-cancelled",
        ridecancel
    );

    return resp.status(200).json(
        new ApiResponse(
            200,
            ridecancel,
            "Ride cancelled successfully"
        )
    );

});


const arrivedRide=asynchandler(async (req,resp)=>{
    const {rideId}=req.body;
    if(!rideId){
        throw new ApiError(404,"rideId is rquired")
    }
     const existingRide = await Ride.findById(rideId);

    if (!existingRide) {
        throw new ApiError(404, "Ride not found");
    }

    if(existingRide.rideStatus !== "accepted"){
    throw new ApiError(
        400,
        "Ride must be accepted first"
    );
}


    if(existingRide.rideStatus ==="completed" || 
        existingRide.rideStatus === "cancelled"||
         existingRide.rideStatus ==="arrived"){
            throw new ApiError(404,"Ride cannot be arrived ")

    }
    let io=getIO();

    const ridearrived=await Ride.findByIdAndUpdate(  rideId,
        {
            rideStatus: "arrived"
        },
        { new: true });

    if(!ridearrived){
        throw new ApiError(404,"Error in ride arived")
    }
    io.to(ridearrived.userId.toString()).emit(
    "ride-arrived",
    ridearrived
)

    return resp.status(200).json(new ApiResponse(200,ridearrived,"Ride arrived successfully"))
})


const startRide=asynchandler(async (req,resp)=>{
  const {rideId}=req.body;

   if(!rideId){
        throw new ApiError(404,"rideId is rquired")
    }
     const existingRide = await Ride.findById(rideId);

    if (!existingRide) {
        throw new ApiError(404, "Ride not found");
    }

    if(existingRide.rideStatus !== "arrived"){
    throw new ApiError(
        400,
        "Ride must be arrived first"
    );
}


 if(existingRide.rideStatus ==="completed" || 
        existingRide.rideStatus === "cancelled"||
         existingRide.rideStatus ==="started"){
            throw new ApiError(404,"Ride cannot be start ")

    }

    let io=getIO();

    const ridestart=await Ride.findByIdAndUpdate(  rideId,
        {
            rideStatus: "started",
            startedAt: new Date()
        },
        { new: true });

    if(!ridestart){
        throw new ApiError(400,"error in ride started")
    }
    io.to(ridestart.userId.toString()).emit("ride-started",ridestart)

    return resp.status(201).json(new ApiResponse(201,ridestart,"Ride is started now"))


})

const completeRide=asynchandler(async (req,resp)=>{
    const {rideId}=req.body;

   if(!rideId){
        throw new ApiError(404,"rideId is rquired")
    }
     const existingRide = await Ride.findById(rideId);

    if (!existingRide) {
        throw new ApiError(404, "Ride not found");
    }

    if(existingRide.rideStatus !== "started"){
    throw new ApiError(
        400,
        "Ride must be start first"
    );
}


 if(existingRide.rideStatus ==="completed" || 
        existingRide.rideStatus === "cancelled"
        ){
            throw new ApiError(404,"Ride cannot be complted ")

    }

    let io=getIO();
    const ridecomplete=await Ride.findByIdAndUpdate(  rideId,
        {
            rideStatus: "completed",
            endedAt: new Date()
        },
        { new: true });

    if(!ridecomplete){
        throw new ApiError(400,"Error in ride complted")
    }
    io.to(ridecomplete.userId.toString()).emit("ride-complete",ridecomplete)

    return resp.status(200).json(new ApiResponse(200,ridecomplete,"Ride is complted successfully"))
    

})

const getRidebyId=asynchandler(async (req,resp)=>{
        const {rideId}=req.params;
   if(!rideId){
    throw new ApiError(400,"ride id is required")
   }

   const ride=await Ride.findById(rideId)
    .populate("userId", "fullName phone profileImage")
    .populate("driverId", "licenseNumber rating");
   if(!ride){
    throw new ApiError(404,"Ride does not exist")
   }

   return resp.status(200).json(new ApiResponse(200,ride,"ride data fetch successfully "))
})


const userridehistory=asynchandler(async (req,resp)=>{
        const {userId}=req.params

        if(!userId){
            throw new ApiError(400,"userid is required")
        }


        const userridehistory=await Ride.find({userId})
        .populate("userId", "fullName phone profileImage")

        if(!userridehistory){
            throw new ApiError(400,"Error in fetching user ridehidtory")
        }

        return resp.status(200).json(200,userridehistory,"user ride history is fetch succesfully ")


        

})

const driverridehistory=asynchandler(async (req,resp)=>{
     const {driverId}=req.params

        if(!driverId){
            throw new ApiError(400,"driverid is required")
        }


        const driverridehistory=await Ride.find({driverId})
        .populate("driverId", "licenseNumber rating");

        if(!driverridehistory){
            throw new ApiError(400,"Error in fetching user driverhidtory")
        }

        return resp.status(200).json(200,driverridehistory,"driver ride history is fetch succesfully ")



})

const getcurrentride=asynhabdler(async (req,resp)=>{
     const {rideId}=req.params;
   if(!rideId){
    throw new ApiError(400,"ride id is required")
   }

   const ride=await Ride.findById(rideId)
    .populate("userId", "fullName phone profileImage")
    .populate("driverId", "licenseNumber rating");
   if(!ride){
    throw new ApiError(404,"Ride does not exist")
   }

   return resp.status(200).json(new ApiResponse(200,ride,"ride data fetch successfully "))


})



export {
    createriderequest,
    acceptRide,
    cancelRide,
    arrivedRide,
    startRide,
    completeRide,
    getRidebyId,
    userridehistory,
    driverridehistory,
    
};