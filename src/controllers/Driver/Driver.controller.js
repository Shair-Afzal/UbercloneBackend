import ApiError from "../../utils/ApiError.js";
import { Driver } from "../../models/Driver/Driver.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asynchandler from "../../utils/asynchandler.js";
import aggreagatePaginate from "mongoose-aggregate-paginate-v2";
import { User } from "../../models/User/user.model.js";
import { Vehicle } from "../../models/Vehicle/Vehicle.model.js";


const createdriver=asynchandler(async (req,resp)=>{
    const {licenseNumber, vehicleId}=req.body;
    if(  !licenseNumber || !vehicleId){
        throw new ApiError(404,"all fields are required")
    }
    const user= await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(400,"user does not exist")
    }
    const vechile=await Vehicle.findById(vehicleId)
    if(!vechile){
        throw new ApiError(404,"vechile does not exist")
    }

    const driver=await Driver.create({
        userId:req.user?._id,
        licenseNumber,
        vehicleId
    })
    if(!driver){
        throw new ApiError(500,"Error in creating driver ")
    }
    return resp.status(200).json(new ApiResponse(200,driver,"you request is send please wait for further process"))
})


const getalldriver=asynchhandler(async (req,resp)=>{
    const page=parseInt(req.query.page) || 1;
    const limit=parseInt(req.query.limit) || 10;

    const aggregation=Driver.aggregate([
        {
            
                $lookup:{
                    from:"users",
                    localField:"userId",
                    foreignField:"_id",
                    as:"user"
                }

            
        },
        {
            $unwind:"$user"
        },
        {
            $lookup:{
                from:"vehicles",
                localField:"vehicleId",
                foreignField:"_id",
                as:"vechile"
            }
        },
        {
            $unwind:"$vechile"
        }
    ])

    const drivers=await aggreagatePaginate(aggregation,{page,limit});
    if(!drivers){
        throw new ApiError(404,"Error fetching drivers")
    }

    return resp.status(200).json(new ApiResponse(200,drivers,"Drivers fetch successfuly"))




})


const getdriverbyid=asynchandler(async (req,resp)=>{
    const {id}=req.params;
    if(!id){
        throw new ApiError(404,"id is required")
    }
    const driver=await Driver.findById(id);
    if(!driver){
        throw new ApiError(404,"driver does not exist")
    }

    return resp.status(200).json(new ApiResponse(200,driver,"driver fetch successfully"))

   
})


const updatedriver=(async (req,resp)=>{

    const {licenseNumber}=req.body;
    if(!licenseNumber){
        throw new ApiError(404,"all fields are required");

    }

    const driver=await Driver.findOne({userId:req.user?._id});
    if(!driver){
        throw new ApiError(400,"Driver doset not exist")

    }

    const updatedriver=await Driver.findByIdAndUpdate(req.user?._id,{
        $set:licenseNumber
    },{new:true})

    return resp.status(200).json(new ApiResponse(200,updatedriver,"Drive profile update successfully"))
    
    


})


export {createdriver,getalldriver}