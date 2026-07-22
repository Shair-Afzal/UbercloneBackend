import {ApiError} from "../../utils/ApiError.js";
import {Vehicle} from "../../models/Vehicle/Vehicle.model.js"
import {ApiResponse} from "../../utils/ApiResponse.js";
import {asynchandler} from "../../utils/asynchandler.js";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
// import { User } from "../../models/User/user.model.js";



const addVechile=asynchandler(async (req,resp)=>{
    const {driverId,vehicleType,company,model,color,plateNumber,year}=req.body;
    if(!driverId || !vehicleType || !company || !model || !color || !plateNumber || !year){
        throw new ApiError(400,"All fields are required")
    }
    const existingVehicle=await Vehicle.findOne({plateNumber})
    if(existingVehicle){
        throw new ApiError(400,"Vehicle with this plate number already exists")
    }
    const newVehicle=await Vehicle.create({driverId,vehicleType,company,model,color,plateNumber,year})
    if(!newVehicle){
        throw new ApiError(500,"Error creating vehicle")
    }

    return resp.status(200).json(new ApiResponse(200,newVehicle,"Vehicle added successfully"))


})

const getAllVehicles=asynchandler(async (req,resp)=>{
 const page=parseInt(req.query.page) || 1;
    const limit=parseInt(req.query.limit) || 10;

    const vechileaggregate=Vehicle.aggregate(
        [
            {
            $project : {
                plateNumber: 0,
            },

        },
        {
            $sort:{
                createdAt:-1
            }
        }
        ]

    );

    const vechiles=await Vehicle.aggregatePaginate(vechileaggregate,{page,limit})
    if(!vechiles){
        throw new ApiError(500,"Error fetching vehicles")
    }
    return resp.status(200).json(new ApiResponse(200,vechiles,"Vehicles fetched successfully"))


})

const getVehicleById=asynchandler(async (req,resp)=>{
    const {id}=req.params;
    if(!id){
        throw new ApiError(400,"Id required");
    }

    const vechile=await Vehicle.findById(id)
    if(!vechile){
        throw new ApiError(400,"no vechile exist")
    }

    return resp.status(200).json(new ApiResponse(200,vechile,"Vechile fectch successfully "))

})

const updateVechile=asynchandler(async (req,resp)=>{
    const {id,vehicleType,company,model,color,plateNumber,year}=req.body;
     if(!id || !vehicleType || !company || !model || !color || !plateNumber || !year){
        throw new ApiError(400,"All fields are required")
    }
    const updatedata={
        vehicleType,
        company,
        model,
        color,
        plateNumber,
        year,
    }

    const vechile=await Vehicle.findById(id)
    if(!vechile){
        throw new ApiError(400,"no vechile found")
    }

    const vechileupdate=await Vehicle.findByIdAndUpdate(id,{
       $set:updatedata
    },{new:true})
    if(!vechileupdate){
        throw new ApiError(500,"Error in updating vechile")
    }

    return resp.status(201).json(new ApiResponse(200,vechileupdate))
    



})

const delteVechile=asynchandler(async (req,resp)=>{
    const {id}=req.body;

    if(!id){
        throw new ApiError(400,"id is required")
    }
    const deleltevechile=await Vehicle.findByIdAndDelete(id);
    if(!deleltevechile){
        throw new ApiError(500,"Error in deleting vechile")
    }
})





export {addVechile,getAllVehicles,getVehicleById,updateVechile,delteVechile}