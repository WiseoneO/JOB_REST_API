const express = require("express");

const router = express.Router();

const {getJobs,postJob,getJobsInRadius,updateJob,deletejob,getJob,jobStats} = require("../controllers/jobsController")

const {isAuthenticatedUser, authorizeRoles} = require("../middlwweares/auth");

router.route("/jobs").get(getJobs)
router.route("/job/:id/:slug").get(getJob)
router.route("/jobs/:zipcode/:distance").get(getJobsInRadius)
router.route("/stats/:topic").get(jobStats)

router.route("/job/new").post(isAuthenticatedUser, authorizeRoles("employer", "admin"), postJob)
router.route("/job/:id").put(isAuthenticatedUser, authorizeRoles("employer", "admin"), updateJob).delete(isAuthenticatedUser, authorizeRoles("employer", "admin"), deletejob)



module.exports = router