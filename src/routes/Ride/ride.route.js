import { Router } from "express";
import { createriderequest,acceptRide,cancelRide,arrivedRide,startRide,completeRide,getRidebyId,getcurrentride,getRideRequests,nearbyDrivers} from "../../controllers/Ride/Ride.controller.js";
import { verifyjwt } from "../../middleware/Verifyjwt.js";



const router=Router()


router.route("/createriderequest").post(verifyjwt,createriderequest);
router.route("/acceptride").post(verifyjwt,acceptRide)
router.route("/cancelride").post(verifyjwt,cancelRide)
router.route("/arrivedride").post(verifyjwt,arrivedRide)
router.route("/startride").patch(verifyjwt,startRide)
router.route("/completeride").patch(verifyjwt,completeRide)
router.route("/getridebyid/:rideId").get(verifyjwt,getRidebyId)
router.route("/getcurrentride/:rideId").get(verifyjwt,getcurrentride)
router.route("/getallrequests").get(verifyjwt,getRideRequests)
router.route("/nearby").get(verifyjwt,nearbyDrivers)








export default router