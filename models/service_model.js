const mongoose = require("mongoose");

// UPDATED — added: category_id, maxCapacity, isGroup, allowedStaff[]

const serviceSchema = new mongoose.Schema(
  {
    tenant_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },  // NEW

    name: { type: String, required: true },
    description: { type: String },                                            // NEW
    imageUrl: {
      type: String,
      default: "https://res.cloudinary.com/halqetelzekr/image/upload/v1678732276/placeholder_t7jyyi.png",
    },
    cloudinary_id: { type: String },

    duration: { type: Number, required: true },  // minutes
    price:    { type: Number, required: true },
    currency: { type: String, default: "USD" },  // NEW

    // Group class support                                                     // NEW
    isGroup:     { type: Boolean, default: false },
    maxCapacity: { type: Number, default: 1 },    // 1 = 1-on-1

    // Which staff can deliver this service (many-to-many)                    // NEW
    // (Staff model also references service but only one — now moved here)
    allowedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: "Staff" }],

    // Booking buffer time                                                      // NEW
    bufferBefore: { type: Number, default: 0 },  // minutes gap before session
    bufferAfter:  { type: Number, default: 0 },  // minutes gap after session

    isActive:  { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }, // NEW
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
