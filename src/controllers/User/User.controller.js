import ApiError from "../../utils/ApiError.js";
import { User } from "../../models/User/user.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asynchandler from "../../utils/asynchandler.js";
import { sendEmail } from "../../middleware/Sendmail.js";
import aggreagatePaginate from "mongoose-aggregate-paginate-v2";


const generateToken=async (user)=>{
    try{
        const accessToken=User.genreateaccessToken(user?._id)
        const refreshToken=User.genreaterefreshToken(user?._id)
        user.refreshToken=refreshToken;
        user.save();
        return {accessToken,refreshToken}

    }catch(err){
        throw new ApiError("Error generating token",500)

    }

}


const registerUser=asynchandler(async (req,resp)=>{
    const {fullName,email,phone,password,role}=req.body;
    if(!fullName || !email || !phone || !password || !role){
        throw new ApiError("All fields are required",400)
    }

const existinguser=await User.findOne({email})
if(existinguser){
    throw new ApiError(400,"user already exists")
}
const newuser=await User.create({fullName,email,phone,password})
if(!newuser){
    throw new ApiError("Error creating user",500)
}

return resp.status(200).json(new ApiResponse(200,newuser,"user created successfully"))
})

const loginuser=asynchandler(async (req,resp)=>{
    const {email,password}=req.body;
    if(!email || !password){
        throw new ApiError("Email and password are required",400)
    }
const user=await User.findOne({email})
if(!user){
    throw new ApiError("User not found",404)
}
const isPasswordValid=await user.isPasswordCorrect(password)
if(!isPasswordValid){
    throw new ApiError("Invalid credentials",401)
}
const {accessToken,refreshToken} =await generateToken(user)
const options={
    httpOnly:true,
    secure:true,
}
return resp.status(200).
cookie("refreshToken",refreshToken,options).
cookie("accessToken",accessToken,options).
json(new ApiResponse(200,{accessToken},"user logged in successfully"))

})

const logoutuser=asynchandler(async (req,resp)=>{
   await User.findByIdAndUpdate(req.user._id,
    {

        $set:{
            refreshToken:undefined
        }
    }


)
const options={
    httpOnly:true,
    secure:true,
    
}
return resp.status(200).
cookie("refreshToken","",options).
cookie("accessToken","",options).
json(new ApiResponse(200,{},"user logged out successfully"))
})

const Forgetpassword=asynchandler(async (req,resp)=>{
    const {email}=req.body;
    if(!email){
        throw new ApiError("Email is required",400)
    }
    const user=await User.findOne({email})
    if(!user){
        throw new ApiError("User not found",404)
    }
    const otp=await sendEmail(email,"Password reset code")
 if(!otp){
    throw new ApiError("Failed to send email",500)
 }
  const hashedOtp = await bcrypt.hash(otp, 10);
 user.resetOtp=hashedOtp;
 user.resetOtpExpiry=Date.now() + 5 * 60 * 1000; 
 await user.save();

 return resp.status(200).json(new ApiResponse(200,{otp},"Password reset code sent successfully"))
})

const  VerifyOtp=asynchandler(async (req,resp)=>{
    const {email,otp}=req.body;
    if(!otp||!email){
        throw new ApiError("OTP and email are required",400)
    }
     const user = await User.findOne({email});
    const compareOtp=await bcrypt.compare(otp,user.resetOtp)
  
    if(!compareOtp){
        throw new ApiError("Invalid OTP",400)
    }
    if(Date.now() > user.resetOtpExpiry){
        throw new ApiError("OTP has expired",400)
    }
    const resettoken=jwt.sign({id:user._id},process.env.RESET_TOKEN_SECRET,{expiresIn:process.env.RESET_TOKEN_EXPIRY})

    user.resetpasswordToken=resettoken;
    user.resetpasswordTokenExpiry=Date.now() + 15 * 60 * 1000; 
    await user.save();

    

    return resp.status(200).json(new ApiResponse(200,{},"OTP verified successfully"))
})


const resetpassword=asynchandler(async (req,resp)=>{
    const {newpassword,confirmpassword,resettoken}=req.body;
    if(!newpassword || !confirmpassword || !resettoken){
        throw new ApiError("New password, confirm password and reset token are required",400)
    }

    if(newpassword!==confirmpassword){
        throw new ApiError("New password and confirm password do not match",400)
    }

    const user = await User.findOne({ resetpasswordToken: resettoken });
    if (!user) {
        throw new ApiError("Invalid reset token",400)
    }

    user.password=newpassword;
    user.resetpasswordToken=undefined;
    user.resetpasswordTokenExpiry=undefined;
    await user.save();
    return resp.status(200).json(new ApiResponse(200,{},"Password reset successfully"))
    
})

const getcurrentuser=asynchandler(async (req,resp)=>{
    const {id}=req.paramas;
    const user=await User.findById(id).select("-password -refreshToken")
    if(!user){
        throw new ApiError("User not found",404)
    }
    return resp.status(200).json(new ApiResponse(200,user,"User fetched successfully"))
})
const getallusers=asynchandler(async (req,resp)=>{
    const page=parseInt(req.query.page) || 1;
    const limit=parseInt(req.query.limit) || 10;

    const usersaggeragations=User.aggregate([
        {
            $project:{
                  password: 0,
          refreshToken: 0,
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        }
    ])

    const users=await User.aggregatePaginate(usersaggeragations,{page,limit})
    return resp.status(200).json(new ApiResponse(200,users,"Users fetched successfully"))
})



export {registerUser,loginuser,Forgetpassword,logoutuser,verifyOtp,resetpassword,getcurrentuser,getallusers}