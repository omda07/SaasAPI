const mongoose = require("mongoose");

// TenantPlan is the SaaS-level billing — what plan the tenant itself is on.
// Separate from MembershipPlan (which is what the tenant sells to customers).

const tenantPlanSchema = new mongoose.Schema(
  {
    tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, unique: true },

    plan: {
      type: String,
      enum: ["free", "starter", "pro", "enterprise"],
      default: "free",
    },

    status: {
      type: String,
      enum: ["active", "trialing", "past_due", "cancelled", "paused"],
      default: "trialing",
    },

    trialEndsAt: { type: Date },
    currentPeriodStart: { type: Date },
    currentPeriodEnd:   { type: Date },

    // Feature flags derived from plan — store explicitly so UI can read fast
    limits: {
      maxStaff:      { type: Number, default: 2 },    // free = 2, pro = unlimited (-1)
      maxServices:   { type: Number, default: 5 },
      maxBookings:   { type: Number, default: 100 },  // per month
      qrCheckin:     { type: Boolean, default: false },
      memberships:   { type: Boolean, default: false },
      groupSessions: { type: Boolean, default: false },
      analytics:     { type: Boolean, default: false },
      customDomain:  { type: Boolean, default: false },
      apiAccess:     { type: Boolean, default: false },
      smsReminders:  { type: Boolean, default: false },
    },

    billing: {
      customerId:      { type: String },   // Stripe customer ID
      subscriptionId:  { type: String },   // Stripe subscription ID
      paymentMethodId: { type: String },
      billingEmail:    { type: String },
      interval: { type: String, enum: ["monthly", "yearly"] },
      amount:   { type: Number },
      currency: { type: String, default: "USD" },
      lastInvoiceAt: { type: Date },
      nextInvoiceAt: { type: Date },
    },

    cancelledAt:    { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TenantPlan", tenantPlanSchema);
