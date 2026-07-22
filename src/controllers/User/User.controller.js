import { ApiError } from "../../utils/ApiError.js";
import { User } from "../../models/User/user.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asynchandler } from "../../utils/asynchandler.js";
import { sendEmail } from "../../middleware/Sendmail.js";
import aggreagatePaginate from "mongoose-aggregate-paginate-v2";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";


const generateToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.genreateaccessToken()
        const refreshToken = user.genreaterefreshToken()
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken }

    } catch (err) {
        console.log("err in genrating token is ", err)
        throw new ApiError(500, "Error generating token")

    }

}


const registerUser = asynchandler(async (req, resp) => {
    const { fullName, email, phone, password, role } = req.body;
    if (!fullName || !email || !phone || !password || !role) {
        throw new ApiError(400, "All fields are required")
    }

    const existinguser = await User.findOne({ email })
    if (existinguser) {
        throw new ApiError(400, "user already exists")
    }
    const newuser = await User.create({ fullName, email, phone, password, role })
    if (!newuser) {
        throw new ApiError(404, "Error creating user")
    }

    return resp.status(200).json(new ApiResponse(200, newuser, "user created successfully"))
})

const loginuser = asynchandler(async (req, resp) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required")
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {

        throw new ApiError(401, "Invalid credentials")
    }
    const { accessToken, refreshToken } = await generateToken(user?._id)
    const options = {
        httpOnly: true,
        secure: false,
    sameSite: "lax",
    }
    return resp.status(200).
        cookie("refreshToken", refreshToken, options).
        cookie("accessToken", accessToken, options).
        json(new ApiResponse(200, {user, accessToken }, "user logged in successfully"))

})

const logoutuser = asynchandler(async (req, resp) => {
    await User.findByIdAndUpdate(req.user?._id,
        {

            $set: {
                refreshToken: undefined
            }
        }


    )
    const options = {
        httpOnly: true,
        secure: true,

    }
    return resp.status(200).
        cookie("refreshToken", "", options).
        cookie("accessToken", "", options).
        json(new ApiResponse(200, {}, "user logged out successfully"))
})

const Forgetpassword = asynchandler(async (req, resp) => {

    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required")
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const otp = await sendEmail(email, "Password reset code")
    if (!otp) {
        throw new ApiError(500, "Failed to send email")
    }
    const hashedOtp = await bcrypt.hash(String(otp), 10);
    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    return resp.status(200).json(new ApiResponse(200, { otp }, "Password reset code sent successfully"))
})

const VerifyOtp = asynchandler(async (req, resp) => {
    const { email, otp } = req.body;
    if (!otp || !email) {
        throw new ApiError(400, "OTP and email are required")
    }
    const user = await User.findOne({ email });
    const compareOtp = await bcrypt.compare(otp, user.resetOtp)

    if (!compareOtp) {
        throw new ApiError(400, "Invalid OTP")
    }
    if (Date.now() > user.resetOtpExpiry) {
        throw new ApiError("OTP has expired", 400)
    }
    const resettoken = jwt.sign({ id: user._id }, process.env.RESET_TOKEN_SECRET, { expiresIn: process.env.RESET_TOKEN_EXPIRY })

    user.resetpasswordToken = resettoken;
    user.resetpasswordTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();



    return resp.status(200).json(new ApiResponse(200, { resettoken }, "OTP verified successfully"))
})


const resetpassword = asynchandler(async (req, resp) => {
    const { newpassword, confirmpassword, resettoken } = req.body;
    if (!newpassword || !confirmpassword || !resettoken) {
        throw new ApiError("New password, confirm password and reset token are required", 400)
    }

    if (newpassword !== confirmpassword) {
        throw new ApiError("New password and confirm password do not match", 400)
    }

    const user = await User.findOne({ resetpasswordToken: resettoken });
    if (!user) {
        throw new ApiError("Invalid reset token", 400)
    }

    user.password = newpassword;
    user.resetpasswordToken = undefined;
    user.resetpasswordTokenExpiry = undefined;
    await user.save();
    return resp.status(200).json(new ApiResponse(200, {}, "Password reset successfully"))

})

const getcurrentuser = asynchandler(async (req, resp) => {
    const { id } = req.params;
    const user = await User.findById(id).select("-password -refreshToken")
    if (!user) {
        throw new ApiError(404,"User not found")
    }
    return resp.status(200).json(new ApiResponse(200, user, "User fetched successfully"))
})
const getallusers = asynchandler(async (req, resp) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const usersaggeragations = User.aggregate([
        {
            $project: {
                password: 0,
                refreshToken: 0,
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    const users = await User.aggregatePaginate(usersaggeragations, { page, limit })
    return resp.status(200).json(new ApiResponse(200, users, "Users fetched successfully"))
})

const  regenerateaccessToken =asynchandler(async(req,resp)=>{
    console.log("cookies",req.cookies);
      const incommingrefreshtoken =
    req.cookies.refreshToken || req.body.refreshToken;
     console.log("Incoming Token:", incommingrefreshtoken);
    if(!incommingrefreshtoken){
        throw new ApiError(404,"no refresh token  is found")
    }
   

    const decodetoken = jwt.verify(incommingrefreshtoken,process.env.REFRESH_TOKEN_SECRET)
    const user=await User.findById(decodetoken?.id)
     if (!user || user.refreshToken !== incommingrefreshtoken) {
    throw new ApiError(403, "Invalid refresh token");
  }
  console.log(decodetoken);
  console.log(user)
      const { accessToken, refreshToken } = await generateToken(user?._id)
   const options = {
    httpOnly: true,
    secure: true,
  };
   return resp.status(200).
        cookie("refreshToken", refreshToken, options).
        cookie("accessToken", accessToken, options).
        json(new ApiResponse(200, { refreshToken }, "user logged in successfully"))

})



export { registerUser, loginuser, Forgetpassword, logoutuser, VerifyOtp, resetpassword, getcurrentuser, getallusers , regenerateaccessToken}