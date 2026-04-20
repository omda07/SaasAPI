const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },

    availability: [
      {
        day: Number,
        slots: [
          {
            start: String,
            end: String,
          },
        ],
      },
    ],
    daysOff: [String],

    isOff: {
      type: Boolean,
      default: false,
    },

    tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Staff", staffSchema);
