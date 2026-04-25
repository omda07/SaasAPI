const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const tenantPlanCtrl = require("../controllers/tenantPlanController");

router.get("/", auth, tenantPlanCtrl.getCurrentPlan);
router.post("/upgrade", auth, tenantPlanCtrl.upgradePlan);

module.exports = router;