import {User} from "../models/User/user.model.js"
import ApiError from "../utils/ApiError.js"
import Jwt from "jsonwebtoken"
import asynchandler from "../utils/asynchandler.js"


const verifyjwt=asynchandler(async (req,resp,next)=>{
    try{
    const token=
    req.cookies?.accessToken||req.header("Authorization").replace("Bearer ","")
    if(!token){
        throw new ApiError("unauthorized access",401)

    }

    const decodetoken=await Jwt.verify(token,Process.env.ACCESS_TOKEN_SECRET)
    const user=await User.findById(decodetoken._id).select("-password -refreshToken")
    if(!user){
        throw new ApiError("Invalid access token",401)
    }
    req.user=user;
    next();
}catch(err){
    throw new ApiError("Invalid access token",401)
}
})