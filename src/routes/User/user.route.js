import { Router } from "express";
import { loginuser, registerUser } from "../../controllers/User/user.controller.js";
import { verifyjwt } from "../../middleware/Verifyjwt.js";

const router=Router();

router.route("/registeruser").post(registerUser)
router.route("/loginuser").post(verifyjwt,loginuser)




export default router