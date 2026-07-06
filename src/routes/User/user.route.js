import { Router } from "express";
import { loginuser, registerUser } from "../../controllers/User/user.controller.js";

const router=Router();

router.route("/registeruser").post(registerUser)
router.route("/loginuser").post(loginuser)




export default router