const mongoose = require("mongoose");
const Joi = require("joi");
const { joiPasswordExtendCore } = require("joi-password");
const joiPassword = Joi.extend(joiPasswordExtendCore);

// -------------------------
// Mongoose User Schema
// -------------------------
const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    minlength: 3,
    maxlength: 44,
    // unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  noId: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  tenant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required:true
  },
  language: {
    type: String,
    default: "en", // en, ar, fr...
  },
  currency: {
    code: {
      type: String,
      default: "USD",
    },
    symbol: {
      type: String,
      default: "$",
    },
  },
  role: {
    type: String,
    enum: ["owner", "admin", "staff", "customer"],
    default: "customer",
  },
}, { timestamps: true });
UserSchema.index({ userName: 1, tenant_id: 1 }, { unique: true });
// -------------------------
// Joi Validation for Register
// -------------------------
function validateUser(user) {
  const schema = Joi.object({
    userName: Joi.string().min(3).max(44).required().trim().lowercase(),
    tenant_id: Joi.string().hex().length(24).required(),
    role: Joi.string().valid("owner", "admin", "staff", "customer").optional(),
    currency: Joi.object({
      code: Joi.string().optional(),
      symbol: Joi.string().optional(),
    }).optional(),
    language: Joi.string().optional(),
    password: joiPassword
      .string()
      .minOfLowercase(1)
      .minOfUppercase(1)
      .minOfNumeric(1)
      .noWhiteSpaces()
      .min(8)
      .required()
      .messages({
        "string.empty": "{#label} is required",
        "password.minOfLowercase": "{#label} should contain at least {#min} lowercase character",
        "password.minOfUppercase": "{#label} should contain at least {#min} uppercase character",
        "password.minOfNumeric": "{#label} should contain at least {#min} number",
        "password.noWhiteSpaces": "{#label} must not contain spaces",
      }),
  }).options({ abortEarly: false });

  return schema.validate(user);
}

// -------------------------
// Joi Validation for Login
// -------------------------
function validateUserLogin(user) {
  const schema = Joi.object({
    userName: Joi.string().min(3).max(44).required().trim().lowercase(),
    password: joiPassword.string().noWhiteSpaces().required(),
    tenant_id: Joi.string().hex().length(24).required(),
  }).options({ abortEarly: false });

  return schema.validate(user);
}

// -------------------------
// Export
// -------------------------
module.exports = mongoose.model("User", UserSchema);
module.exports.validateUser = validateUser;
module.exports.validateUserLogin = validateUserLogin;
