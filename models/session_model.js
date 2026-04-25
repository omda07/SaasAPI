const mongoose = require("mongoose");

// A "Session" is a scheduled group class or appointment slot.
// Multiple customers can book into one session (up to capacity).
// For 1-on-1 bookings the existing Booking model is fine.
// For group classes (Yoga, Spin, etc.) use Session.

const sessionSchema = new mongoose.Schema(
  {
    tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    staff_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Staff",   required: true },
    category_id:{ type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    title: { type: String },       // e.g. "Morning Yoga" — overrides service name if set
    startAt: { type: Date, required: true },
    endAt:   { type: Date, required: true },
    duration: { type: Number },    // minutes, derived but stored for query convenience

    capacity:  { type: Number, required: true, default: 1 },
    enrolled:  { type: Number, default: 0 },   // incremented on each confirmed attendance
    waitlisted:{ type: Number, default: 0 },

    price: { type: Number },       // can override service.price for this specific session
    isRecurring: { type: Boolean, default: false },
    recurrence: {
      // null if not recurring
      frequency: { type: String, enum: ["daily", "weekly", "monthly"] },
      interval:  { type: Number, default: 1 },  // every N frequency units
      endDate:   { type: Date },
      parentSession_id: { type: mongoose.Schema.Types.ObjectId, ref: "Session" }, // root of series
    },

    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },

    location: { type: String },    // room name, online link, etc.
    notes: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

sessionSchema.virtual("isFull").get(function () {
  return this.enrolled >= this.capacity;
});

sessionSchema.virtual("spotsLeft").get(function () {
  return Math.max(0, this.capacity - this.enrolled);
});

module.exports = mongoose.model("Session", sessionSchema);
