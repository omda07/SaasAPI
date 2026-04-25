const mongoose = require("mongoose");
const joi = require("joi");
const { joiPasswordExtendCore } = require("joi-password");
const joiPassword = joi.extend(joiPasswordExtendCore);

// UPDATED — added: slug, timezone, address, bookingSettings, socialLinks

const TenantSchema = new mongoose.Schema(
  {
    name:         { type: String, minlength: 3, maxlength: 44, unique: true, required: true },
    slug:         { type: String, unique: true, lowercase: true, trim: true },  // NEW — URL identifier e.g. "elite-fitness"
    logo:         { type: String, default: "" },
    coverImage:   { type: String },                      // NEW
    primaryColor: { type: String },
    industry: {                                           // NEW — drives default UI labels
      type: String,
      enum: ["gym", "clinic", "salon", "spa", "dental", "therapy", "other"],
      default: "other",
    },

    // Contact & location                                 // NEW
    phone:   { type: String },
    email:   { type: String },
    website: { type: String },
    address: {
      street:  { type: String },
      city:    { type: String },
      country: { type: String },
      zip:     { type: String },
    },

    timezone: { type: String, default: "UTC" },          // NEW — e.g. "Asia/Dubai"
    currency: { type: String, default: "USD" },          // NEW

    // Working hours (was a String — now structured)
    workingHours: [                                       // UPDATED
      {
        day:   { type: Number },  // 0=Sun … 6=Sat
        open:  { type: String },  // "08:00"
        close: { type: String },  // "22:00"
        isOpen:{ type: Boolean, default: true },
      },
    ],

    // Booking page settings                              // NEW
    bookingSettings: {
      advanceBookingDays:  { type: Number, default: 30 },   // how far ahead customers can book
      minCancellationHours:{ type: Number, default: 24 },   // must cancel at least N hours before
      requireApproval:     { type: Boolean, default: false },// manual confirm vs auto-confirm
      allowGuestBooking:   { type: Boolean, default: true }, // book without account
      showStaffSelection:  { type: Boolean, default: true },
    },

    socialLinks: {                                        // NEW
      instagram: { type: String },
      facebook:  { type: String },
      twitter:   { type: String },
    },

    isActive:   { type: Boolean, default: true },         // NEW
    isVerified: { type: Boolean, default: false },        // NEW — email verification
  },
  { timestamps: true }
);

function validateUser(user) {
  const JoiSchema = joi
    .object({
      name: joi.string().min(3).max(44).required().trim().lowercase(),
    })
    .options({ abortEarly: false });
  return JoiSchema.validate(user);
}

module.exports = mongoose.model("Tenant", TenantSchema);
module.exports.validateUser = validateUser;
