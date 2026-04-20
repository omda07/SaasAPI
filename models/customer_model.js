const mongoose = require("mongoose");
const Joi = require("joi");

const CustomerSchema = new mongoose.Schema({
  tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
  name: String,
  phone: String,
  email: String,
  totalBookings: { type: Number, default: 0 },
  lastVisit: Date

}, { timestamps: true });
function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(44).required().trim(),
    tenant_id: Joi.string().hex().length(24).required(),
    phone: Joi.number().required(),
    email: Joi.string().email().optional(),

  }).options({ abortEarly: false });

  return schema.validate(customer);
}
module.exports = mongoose.model("Customer", CustomerSchema);
module.exports.validateCustomer = validateCustomer;

