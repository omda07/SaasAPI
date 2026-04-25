const mongoose = require("mongoose");

// An Invoice is generated for any chargeable event:
// a booking, a session registration, a membership purchase, or a manual charge.

const invoiceSchema = new mongoose.Schema(
  {
    tenant_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Tenant",   required: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },

    invoiceNumber: { type: String, unique: true },  // auto-generated e.g. INV-00042

    items: [
      {
        description: { type: String, required: true },
        quantity:    { type: Number, default: 1 },
        unitPrice:   { type: Number, required: true },
        total:       { type: Number, required: true },
        // Link to source
        booking_id:    { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
        session_id:    { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
        membership_id: { type: mongoose.Schema.Types.ObjectId, ref: "Membership" },
      },
    ],

    subtotal:    { type: Number, required: true },
    taxRate:     { type: Number, default: 0 },
    taxAmount:   { type: Number, default: 0 },
    discount:    { type: Number, default: 0 },
    total:       { type: Number, required: true },
    currency:    { type: String, default: "USD" },

    status: {
      type: String,
      enum: ["draft", "sent", "paid", "partial", "overdue", "cancelled", "refunded"],
      default: "draft",
    },

    payment: {
      method:         { type: String },
      transaction_id: { type: String },
      paidAt:         { type: Date },
      gateway:        { type: String },  // "stripe", "tap", "cash", etc.
    },

    dueDate:    { type: Date },
    notes:      { type: String },
    isDeleted:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-generate invoice number before save
invoiceSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model("Invoice").countDocuments({ tenant_id: this.tenant_id });
    this.invoiceNumber = `INV-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);
