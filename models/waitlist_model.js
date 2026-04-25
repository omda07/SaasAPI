const mongoose = require("mongoose");

// When a Session is full, customers join the Waitlist.
// If a spot opens (cancellation), the first in line is auto-notified.

const waitlistSchema = new mongoose.Schema(
  {
    tenant_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Tenant",   required: true },
    session_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Session",  required: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },

    position: { type: Number, required: true },  // 1 = first in line

    status: {
      type: String,
      enum: ["waiting", "notified", "confirmed", "expired", "removed"],
      default: "waiting",
    },

    notifiedAt:  { type: Date },   // when we told them a spot opened
    expiresAt:   { type: Date },   // deadline to confirm before offer passes to next person
    confirmedAt: { type: Date },
  },
  { timestamps: true }
);

waitlistSchema.index({ session_id: 1, position: 1 });
waitlistSchema.index({ session_id: 1, customer_id: 1 }, { unique: true });

module.exports = mongoose.model("Waitlist", waitlistSchema);
