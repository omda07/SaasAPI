const mongoose = require("mongoose");

// UPDATED — service_id (single) → services[] (array), added bio, phone, color

const staffSchema = new mongoose.Schema(
  {
    tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },

    name:   { type: String, required: true },
    bio:    { type: String },               // NEW — shown on public booking page
    phone:  { type: String },               // NEW
    email:  { type: String },               // NEW
    imageUrl: { type: String },             // NEW — staff avatar
    color:  { type: String },               // NEW — calendar color e.g. "#3B51E8"

    // CHANGED: was service_id (single ObjectId) — now an array
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],   // NEW

    availability: [
      {
        day: Number,   // 0=Sun … 6=Sat
        slots: [
          {
            start: String,  // "09:00"
            end:   String,  // "17:00"
          },
        ],
      },
    ],
    daysOff: [String],  // ISO date strings e.g. ["2026-05-01"]

    isOff:     { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },  // NEW

    // Link to user account (optional — if staff has login access)
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },        // NEW
  },
  { timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);
