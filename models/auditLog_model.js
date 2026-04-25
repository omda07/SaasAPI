const mongoose = require("mongoose");

// Immutable audit trail. Write-only — never update or delete these records.
// Useful for compliance, debugging, and "who did what" history.

const auditLogSchema = new mongoose.Schema(
  {
    tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    actor_id:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },   // who triggered it
    actorRole: { type: String },  // snapshot of role at time of action

    action: {
      type: String,
      required: true,
      // e.g. "booking.created", "booking.cancelled", "staff.updated",
      //      "customer.checkin", "membership.paused", "tenant.plan_upgraded"
    },

    entity:    { type: String },  // model name: "Booking", "Customer", etc.
    entity_id: { type: mongoose.Schema.Types.ObjectId },

    before: { type: mongoose.Schema.Types.Mixed },  // state before change
    after:  { type: mongoose.Schema.Types.Mixed },  // state after change

    ip:        { type: String },
    userAgent: { type: String },
    metadata:  { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
    // No update hooks — audit logs are append-only
  }
);

// TTL: auto-delete logs older than 2 years (adjust as needed)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 730 });
auditLogSchema.index({ tenant_id: 1, action: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
