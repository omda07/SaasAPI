const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const bookingCtrl = require("../controllers/bookingController");

// CREATE
router.post("/", auth, bookingCtrl.createBooking);

// READ
router.get("/", auth, bookingCtrl.getAllBookings);
router.get("/id", auth, bookingCtrl.getBookingById);

// UPDATE
router.patch("/update", auth, bookingCtrl.updateBooking);

// DELETE (soft)
router.delete("/delete", auth, bookingCtrl.deleteBooking);

module.exports = router;
