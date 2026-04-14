const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },

    dayOfWeek: {
      type: Number, //? 0 = Sunday, 6 = Saturday
      required: true,
    },

    startTime: {
      type: String, //? "09:00"
      required: true,
    },

    endTime: {
      type: String, //? "17:00"
      required: true,
    },

    isOff: {
      type: Boolean,
      default: false,
    },

    tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);
