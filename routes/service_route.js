const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // JWT middleware
const serviceCtrl = require("../controllers/serviceController");

// ----------------------
// CREATE SERVICE
// ----------------------
router.post("/", auth, serviceCtrl.createService);

// ----------------------
// GET SERVICES
// ----------------------

// Get all services for tenant
router.get("/", auth, serviceCtrl.getAllServices);

// Get single service by ID
router.get("/id", auth, serviceCtrl.getServiceById);

// ----------------------
// UPDATE SERVICE
// ----------------------
router.patch("/update", auth, serviceCtrl.updateService);

// ----------------------
// DELETE SERVICE
// ----------------------
router.delete("/delete", auth, serviceCtrl.deleteService);

module.exports = router;
