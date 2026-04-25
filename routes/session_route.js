const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const sessionCtrl = require("../controllers/sessionController");

router.post("/", auth, sessionCtrl.createSession);
router.get("/", auth, sessionCtrl.getSessions);
router.patch("/update", auth, sessionCtrl.updateSession);
router.delete("/cancel", auth, sessionCtrl.cancelSession);  // soft delete

module.exports = router;