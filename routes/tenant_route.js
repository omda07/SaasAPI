const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // JWT middleware
const tenantCtrl = require("../controllers/tenantController");

// ----------------------
// TENANT REGISTRATION
// ----------------------

// Register a new tenant
router.post("/register", tenantCtrl.registerTenant);

// ----------------------
// GET TENANTS
// ----------------------

// Get tenant by ID
router.get("/id", auth, tenantCtrl.getTenantById);

// Get all tenants
router.get("/", auth, tenantCtrl.allTenants);

// ----------------------
// UPDATE TENANT
// ----------------------

// Update tenant profile (name / noId)
router.put("/update", auth, tenantCtrl.updateTenant);

// ----------------------
// DELETE TENANT
// ----------------------

// Delete tenant by ID (admin)
router.delete("/delete/:id", auth, tenantCtrl.deleteTenant);

// Delete tenant by ID from body (admin)
router.delete("/delete", auth, tenantCtrl.deleteTenant);

module.exports = router;
