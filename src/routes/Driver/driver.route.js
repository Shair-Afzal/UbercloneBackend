import { Router } from "express";
import { createdriver,getalldriver,getdriverbyid } from "../../controllers/Driver/Driver.controller.js";
import { verifyjwt } from "../../middleware/Verifyjwt.js";



const router=Router();


router.route("/createdriver").post(createdriver)
router.route("/getalldrivers").get(verifyjwt,getalldriver)
router.route("/getdriver/:id").get(verifyjwt,getdriverbyid)










export default router
