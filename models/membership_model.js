const mongoose = require("mongoose");

// A Membership is a customer's subscription to a tenant's plan.
// It can be unlimited, session-capped, or time-limited.
// Separate from the tenant's SaaS subscription (see tenantPlan_model.js).

const membershipSchema = new mongoose.Schema(
  {
    tenant_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Tenant",       required: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer",     required: true },
    plan_id:     { type: mongoose.Schema.Types.ObjectId, ref: "MembershipPlan", required: true },

    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },

    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "paused", "pending_payment"],
      default: "active",
    },

    // Session-credit tracking (for capped plans)
    totalSessions:     { type: Number },  // null = unlimited
    usedSessions:      { type: Number, default: 0 },
    remainingSessions: { type: Number },  // pre-computed for quick reads

    // Freeze/pause window
    pausedAt:      { type: Date },
    pauseEndsAt:   { type: Date },
    pauseReason:   { type: String },

    autoRenew:     { type: Boolean, default: true },
    renewedFrom:   { type: mongoose.Schema.Types.ObjectId, ref: "Membership" }, // previous period

    payment: {
      status: { type: String, enum: ["paid", "unpaid", "partial", "refunded"], default: "unpaid" },
      method: { type: String },
      transaction_id: { type: String },
      paidAt: { type: Date },
      amount: { type: Number },
    },

    notes: { type: String },
  },
  { timestamps: true }
);

// One active membership per customer per tenant at a time (soft rule, enforced in service layer)
membershipSchema.index({ tenant_id: 1, customer_id: 1, status: 1 });

module.exports = mongoose.model("Membership", membershipSchema);
