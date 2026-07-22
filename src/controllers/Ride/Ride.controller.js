import {ApiError} from "../../utils/ApiError.js";
import { Ride } from "../../models/Ride/Ride.model.js";
import {ApiResponse} from "../../utils/ApiResponse.js";
import {asynchandler} from "../../utils/asynchandler.js";
import { getIO } from "../../sockets/socket.js";
import { User } from "../../models/User/user.model.js";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Driver } from "../../models/Driver/Driver.model.js";

function getDistance(lat1, lon1, lat2, lon2) {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;

    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}



const createriderequest = asynchandler(async (req, resp) => {

    const {
        userId,
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

    const user=await User.findById(userId);
    if(!user){
        throw new ApiError(404,"user does not found")
    }

    const ride = await Ride.create({

        userId: userId,

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

   
    io.to("drivers").emit("new-ride-request", ride);

    return resp.status(201).json(
        new ApiResponse(
            201,
            ride,
            "Ride request created successfully"
        )
    );

});



const acceptRide = asynchandler(async (req, resp) => {

    const { rideId,driverId } = req.body;

    if (!rideId) {
        throw new ApiError(400, "Ride Id and driver id is required");
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
            driverId: driverId, 
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

    const { rideId,reason,userId} = req.body;

    if (!rideId || !reason || !userId) {
        throw new ApiError(400, "Ride Id and reason and userId is required");
    }

    const user=await User.findById(userId)
    if(!user){
        throw new ApiError(404,"user does not exist")
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
            rideStatus: "cancelled",
            cancelledBy:user.role,
    cancelReason:reason
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

const getcurrentride=asynchandler(async (req,resp)=>{
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


const nearbyDrivers = asynchandler(async (req, resp) => {

    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        throw new ApiError(400, "Latitude and Longitude required");
    }

    const drivers = await Driver.find({
        isOnline: true,
        status: "active"
    }).populate("userId", "fullName phone profileImage");

    const nearby = drivers.filter(driver => {

        if (
            !driver.currentLocation ||
            driver.currentLocation.lat == null ||
            driver.currentLocation.lng == null
        ) {
            return false;
        }

        const distance = getDistance(
            Number(latitude),
            Number(longitude),
            driver.currentLocation.lat,
            driver.currentLocation.lng
        );

        return distance <= 5;
    });

    return resp.status(200).json(
        new ApiResponse(
            200,
            nearby,
            "Nearby drivers fetched successfully"
        )
    );

});



const getRideRequests = asynchandler(async (req, resp) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const aggregate = Ride.aggregate([
        {
            $match: {
                rideStatus: "requested"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $project: {
                pickupLocation: 1,
                destination: 1,
                fare: 1,
                distance: 1,
                duration: 1,
                rideType: 1,
                paymentMethod: 1,
                createdAt: 1,
                "user.fullName": 1,
                "user.phone": 1,
                "user.profileImage": 1
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    const rides = await Ride.aggregatePaginate(aggregate, {
        page,
        limit
    });

    return resp.status(200).json(
        new ApiResponse(200, rides, "Ride requests fetched successfully")
    );
});










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
    nearbyDrivers,
    getcurrentride,
    getRideRequests,
    
};