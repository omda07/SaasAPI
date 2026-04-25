const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    tenant_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Tenant",   required: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    staff_id:    { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    service_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    booking_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    session_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Session" },

    rating:  { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 1000 },

    isPublic:  { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    // Staff/owner reply
    reply: {
      text:      { type: String },
      repliedAt: { type: Date },
      repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true }
);

// One review per booking/session per customer
reviewSchema.index({ customer_id: 1, booking_id: 1 }, { unique: true, sparse: true });
reviewSchema.index({ customer_id: 1, session_id: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Review", reviewSchema);
