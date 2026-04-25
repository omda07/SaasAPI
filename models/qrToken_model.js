const mongoose = require("mongoose");
const crypto  = require("crypto");

// A short-lived signed token generated per customer.
// The QR code encodes: { token, tenant_id }
// Scanning hits POST /checkin/scan → validates token → writes Attendance.

const qrTokenSchema = new mongoose.Schema(
  {
    tenant_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Tenant",   required: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },

    // Scope — what this token grants access to:
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },

    token: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(24).toString("hex"),
    },

    // Membership-level QR: no expiry, valid for any session on that day
    type: {
      type: String,
      enum: ["booking", "session", "membership", "guest_pass"],
      default: "booking",
    },

    expiresAt: { type: Date, required: true },   // e.g. Date.now + 15 min for one-time, or EOD for membership
    usedAt:    { type: Date },                   // null until scanned
    isUsed:    { type: Boolean, default: false },
    isRevoked: { type: Boolean, default: false },

    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  // staff who scanned
  },
  { timestamps: true }
);

// Auto-expire via MongoDB TTL index
qrTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("QrToken", qrTokenSchema);
