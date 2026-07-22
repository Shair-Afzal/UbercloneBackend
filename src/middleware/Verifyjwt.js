import { User } from "../models/User/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import Jwt from "jsonwebtoken"
import { asynchandler } from "../utils/asynchandler.js"


export const verifyjwt = asynchandler(async (req, resp, next) => {
    try {
        console.log("cookies received:", req.cookies)
        console.log("header", req.header("Authorization"))
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "unauthorized access")

        }
        console.log("token is : ", token)
        console.log("token scret is ",process.env.ACCESS_TOKEN_SECRET)

        const decodetoken = await Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log("decodetoken is : ", decodetoken)
        const user = await User.findById(decodetoken?.id || decodetoken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid user")
        }
        req.user = user;
        next();
    } catch (err) {
        console.log("the err is:",err)
        throw new ApiError(401, "Invalid access token")
    }
})