const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    icon: { type: String },       // emoji or icon key e.g. "dumbbell"
    color: { type: String },      // hex for UI display
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // display sort order
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
