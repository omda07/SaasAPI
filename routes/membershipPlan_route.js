const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const planCtrl = require("../controllers/membershipPlanController");

router.post("/", auth, planCtrl.createPlan);
router.get("/", auth, planCtrl.getPlans);
router.patch("/update", auth, planCtrl.updatePlan);
router.delete("/delete", auth, planCtrl.deletePlan);

module.exports = router;