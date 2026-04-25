const mongoose = require("mongoose");

// Stores all outbound notifications — SMS, email, push.
// A scheduler reads pending records and dispatches them.

const notificationSchema = new mongoose.Schema(
  {
    tenant_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    user_id:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // What triggered this
    trigger: {
      type: String,
      enum: [
        "booking_confirmed",
        "booking_cancelled",
        "booking_reminder",       // e.g. 24h before
        "session_reminder",
        "waitlist_spot_available",
        "membership_expiring",
        "membership_expired",
        "payment_failed",
        "qr_code_generated",
        "custom",
      ],
      required: true,
    },

    channel: {
      type: String,
      enum: ["sms", "email", "push", "whatsapp", "in_app"],
      required: true,
    },

    to:      { type: String, required: true },  // phone number or email address
    subject: { type: String },                  // for email
    body:    { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed", "cancelled"],
      default: "pending",
    },

    scheduledAt: { type: Date },   // null = send immediately
    sentAt:      { type: Date },
    failReason:  { type: String },

    // References
    booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },

    metadata: { type: mongoose.Schema.Types.Mixed },  // provider-specific response
  },
  { timestamps: true }
);

notificationSchema.index({ status: 1, scheduledAt: 1 });  // for scheduler query

module.exports = mongoose.model("Notification", notificationSchema);
