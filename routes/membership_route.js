const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/membershipController");

router.post("/", auth, ctrl.createMembership);
router.get("/", auth, ctrl.getMemberships);
router.delete("/cancel", auth, ctrl.cancelMembership);

module.exports = router;