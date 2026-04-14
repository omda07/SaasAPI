const mongoose = require("mongoose");
const joi = require("joi");

const { joiPasswordExtendCore } = require("joi-password");
const joiPassword = joi.extend(joiPasswordExtendCore);

// *schema like model of user
const TenantSchema = new mongoose.Schema({
  name: { type: String, minlength: 3, maxlength: 44 ,unique : true,required:true},
  logo: { type: String, default: "" },
  primaryColor: { type: String },
  workingHours: { type: String  },

},
  { timestamps: true }
);

//*validation on user inputs register
function validateUser(user) {
  const JoiSchema = joi
    .object({
      name: joi
        .string()
        .min(3)
        .max(44).required().trim()
        .lowercase(),
    })
    .options({ abortEarly: false });

  return JoiSchema.validate(user);
}


//*export to use this scehma or function in different files
module.exports = mongoose.model("Tenant", TenantSchema);

module.exports.validateUser = validateUser;
