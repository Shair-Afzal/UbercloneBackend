import { Router } from "express";
import { loginuser, registerUser,Forgetpassword,VerifyOtp,resetpassword,getallusers,logoutuser,getcurrentuser,regenerateaccessToken} from "../../controllers/User/User.controller.js";
import { verifyjwt } from "../../middleware/Verifyjwt.js";

const router=Router();

router.route("/registeruser").post(registerUser)
router.route("/loginuser").post(loginuser)
router.route("/forget").post(Forgetpassword)
router.route("/verifyotp").post(VerifyOtp)
router.route("/resetpassword").put(resetpassword)
router.route("/allusers").get(verifyjwt,getallusers)
router.route("/logout").post(logoutuser)
router.route("/getuser/:id").get(verifyjwt,getcurrentuser)
router.route("/refreshtoken").post(regenerateaccessToken)





export default router