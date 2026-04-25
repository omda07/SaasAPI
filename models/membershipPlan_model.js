const mongoose = require("mongoose");

// MembershipPlan is the TEMPLATE a tenant defines.
// Customers then subscribe to a plan → creates a Membership record.

const membershipPlanSchema = new mongoose.Schema(
  {
    tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    name:      { type: String, required: true },  // e.g. "Monthly Unlimited", "10-Class Pack"
    description: { type: String },

    type: {
      type: String,
      enum: ["unlimited", "session_pack", "time_limited"],
      required: true,
    },

    // Pricing
    price:    { type: Number, required: true },
    currency: { type: String, default: "USD" },

    // Duration
    durationDays: { type: Number },   // e.g. 30, 90, 365

    // For session_pack type
    sessionCount: { type: Number },   // how many sessions included

    // Restrictions — which services/categories this plan covers
    // Empty = covers everything
    allowedServices:   [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    allowedCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],

    // Access control
    freezeAllowed:    { type: Boolean, default: false },
    maxFreezeDays:    { type: Number, default: 0 },
    guestPassAllowed: { type: Boolean, default: false },
    maxGuestPasses:   { type: Number, default: 0 },

    isActive:  { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MembershipPlan", membershipPlanSchema);
