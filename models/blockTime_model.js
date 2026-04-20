const mongoose = require("mongoose");

const blockTimeSchema = new mongoose.Schema({
  tenant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  staff_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  startAt: Date,
  endAt: Date,
  reason: String,
});
module.exports = mongoose.model("BlockTime", blockTimeSchema);
