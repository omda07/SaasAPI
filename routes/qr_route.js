const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const qrCtrl = require("../controllers/qrTokenController");

router.post("/generate", auth, qrCtrl.generateToken);
router.post("/validate", auth, qrCtrl.validateToken);

module.exports = router;