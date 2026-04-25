const mongoose = require("mongoose");

// Attendance links a customer to either a Session (group class)
// or a Booking (1-on-1). QR check-in writes to this model.

const attendanceSchema = new mongoose.Schema(
  {
    tenant_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Tenant",   required: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },

    // Exactly one of session_id or booking_id must be set
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },

    staff_id:    { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },  // who conducted
    service_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Service" },

    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      default: "absent",
    },

    checkInAt:  { type: Date },     // timestamp of actual check-in
    checkOutAt: { type: Date },     // optional — for timed sessions
    checkInMethod: {
      type: String,
      enum: ["qr_scan", "manual", "app", "kiosk"],
      default: "manual",
    },

    notes: { type: String },        // e.g. "arrived 10 min late"
  },
  { timestamps: true }
);

// Prevent duplicate attendance record per customer per session/booking
attendanceSchema.index(
  { customer_id: 1, session_id: 1 },
  { unique: true, sparse: true }
);
attendanceSchema.index(
  { customer_id: 1, booking_id: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
