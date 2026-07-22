import { Router } from "express";
import { addVechile,getAllVehicles,getVehicleById,updateVechile,delteVechile } from "../../controllers/Vehicle/Vechile.controller.js";
import { verifyjwt } from "../../middleware/Verifyjwt.js";

const router=Router();



router.route("/addvechile").post(addVechile)
router.route("/getallvechiles").get(verifyjwt,getAllVehicles)
router.route("/getvechile/:id").get(verifyjwt,getVehicleById)
router.route("/updatevechile").put(verifyjwt,updateVechile)
router.route("/deletevechile").delete(verifyjwt,delteVechile)











export default router