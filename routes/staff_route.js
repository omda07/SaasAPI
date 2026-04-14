const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // JWT middleware
const staffCtrl = require("../controllers/staffController");

// ----------------------
// STAFF REGISTRATION
// ----------------------

// Register a new staff member
router.post("/", auth, staffCtrl.registerStaff);

// ----------------------
// GET STAFF
// ----------------------

// Get staff by ID
router.get("/id", auth, staffCtrl.getStaffById);

// Get all staff members
router.get("/", auth, staffCtrl.allStaffs);

// ----------------------
// UPDATE STAFF
// ----------------------

// Update staff profile (name / noId)
router.patch("/update", auth, staffCtrl.updateStaff);

// ----------------------
// DELETE STAFF
// ----------------------

// Delete staff by ID (from params)
router.delete("/delete", auth, staffCtrl.deleteStaff);

// Delete staff by ID (from body)
// router.delete("/delete", auth, staffCtrl.deleteStaffById);

module.exports = router;
