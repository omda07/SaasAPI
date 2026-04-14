const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // JWT middleware
const userCtrl = require("../controllers/userController");

// ----------------------
// AUTH / REGISTRATION
// ----------------------

// Register a new user
router.post("/register", userCtrl.register);

// Login (normal user)
router.post("/login", userCtrl.login);

// Login as admin/owner
router.post("/login-admin", userCtrl.loginAdmin);

// ----------------------
// USER PROFILE
// ----------------------

// Get user profile by token
router.get("/profile", auth, userCtrl.profile);

// Get user by ID
router.get("/id", auth, userCtrl.getUserId);

// Get users by search term
router.get("/search", auth, userCtrl.getUser);

// Get all users
router.get("/", auth, userCtrl.allUsers);

// Get user count
router.get("/count", auth, userCtrl.getUserCount);

// ----------------------
// USER UPDATE
// ----------------------

// Update preferences (language, currency)
router.put("/preferences", auth, userCtrl.updatePreferences);

// Update profile fields
router.put("/profile", auth, userCtrl.updateProfile);

// Change password
router.put("/change-password", auth, userCtrl.changePassword);

// Change role (admin toggle)
router.put("/change-role", auth, userCtrl.changeRole);

// ----------------------
// DELETE USERS
// ----------------------

// Delete own account
router.delete("/delete", auth, userCtrl.deleteUser);

// Delete user by ID (admin only)
router.delete("/delete-user", auth, userCtrl.deleteUserById);

module.exports = router;
