import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import Jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    currentLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
    },

    deviceToken: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
      default: "",
    },
    restOtp:{
      type:String,
      default:""
    },
    resetOtpExpiry:{
      type:Date,
      default:null
    },
    resetpasswordToken:{
      type:String,
      default:null
    },
    resetpasswordTokenExpiry:{
      type:Date,
      default:null
    },
    role: {
    type: String,
    enum: ["user", "driver"],
    default: "user"
}
  },
  {
    timestamps: true,
  }
);

UserSchema.plugin(aggregatePaginate);
export const User = mongoose.model("User", userSchema);



User.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return ;
  }
  this.password=await bcrypt.hash(this.password,10);
})

User.methods.isPasswordCorrect=async function (password){
  return await bcrypt.compare(password,this.password)
}

User.methods.genreateaccessToken=function async (){
  return jwt.sign(
    {
      id:this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  )
}

User.methods.genreaterefreshToken=function async (){
  return jwt.sign(
    {
      id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  )
}


