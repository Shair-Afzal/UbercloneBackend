import nodemailer from "nodemailer";
import ApiError from "../utils/ApiError.js"


export const sendEmail =async (to,subject)=>{
    try{
        const otp = Math.floor(100000 + Math.random() * 900000);
        const transparent=nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.EmailUser,
                pass:process.env.EmailPassword
            }
        })
        const mailOptions={
            from:process.env.EmailUser,
            to:to,
            subject:subject,
              text: `Your password reset code is: ${otp}`
        }
        await transparent.sendMail(mailOptions)
        return otp;

    }catch(err){
        console.log("Error sending email:", err);
        throw new ApiError(400,"Failed to send email")


    }
}