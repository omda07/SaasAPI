const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    staff_id: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    duration: Number,
    price: Number,

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "no_show"],
      default: "pending",
    },

    customer: {
      name: String,
      phone: String,
      email: String,
    },

    notes: String,
    timezone: String,

    payment: {
      status: { type: String, default: "unpaid" },
      method: String,
      transaction_id: String,
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Booking", bookingSchema);
