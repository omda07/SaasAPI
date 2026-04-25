const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const attendanceCtrl = require("../controllers/attendanceController");


router.post("/checkin", auth, attendanceCtrl.checkIn);
router.get("/", auth, attendanceCtrl.getAttendance);

module.exports = router;
