const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    imageUrl:{
      type: String,
      default:"https://res.cloudinary.com/halqetelzekr/image/upload/v1678732276/placeholder_t7jyyi.png"
    },
    cloudinary_id: { type: String, },

     tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
     
    duration: {
      type: Number,
      require: true,
    },
         
    price: {
      type: Number,
      require: true,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
