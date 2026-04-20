const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const availabilityCtrl = require("../controllers/availabilityCtrl");

router.get("/", auth, availabilityCtrl.getAvailability);
router.get("/calendar", auth, availabilityCtrl.getCalendar);
router.get("/analytics", auth, availabilityCtrl.getOverview);

module.exports = router;