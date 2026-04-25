const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const notificationCtrl = require("../controllers/notificationController");

router.post("/", auth, notificationCtrl.sendManualNotification);
router.get("/", auth, notificationCtrl.getNotifications);
router.get("/id", auth, notificationCtrl.getNotificationById);

module.exports = router;