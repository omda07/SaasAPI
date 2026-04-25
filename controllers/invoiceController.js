// controllers/invoiceController.js
const Invoice = require("../models/invoice_model");

const invoiceCtrl = {
  createInvoice: async (req, res) => {
    const { tenant_id, role } = req.user;
    if (!["owner","admin"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
    try {
      const invoice = await Invoice.create({ ...req.body, tenant_id });
      return res.status(201).json({ status: true, data: invoice });
    } catch (err) {
      return res.status(500).json({ status: false, message: [err.message] });
    }
  },
  getInvoices: async (req, res) => {
    const { tenant_id } = req.user;
    const filter = { tenant_id };
    if (req.query.status) filter.status = req.query.status;
    try {
      const invoices = await Invoice.find(filter).populate("customer_id","name").lean();
      return res.status(200).json({ status: true, data: invoices });
    } catch (err) {
      return res.status(500).json({ status: false, message: [err.message] });
    }
  },
// ... (previous createInvoice, getInvoices)

getInvoiceById: async (req, res) => {
  const { tenant_id } = req.user;
  const { id } = req.body;
  try {
    const invoice = await Invoice.findOne({ _id: id, tenant_id }).populate("customer_id","name").lean();
    if (!invoice) return res.status(404).json({ status: false, message: ["Not found"] });
    return res.status(200).json({ status: true, data: invoice });
  } catch (err) {
    return res.status(500).json({ status: false, message: [err.message] });
  }
},

updateInvoice: async (req, res) => {
  const { tenant_id, role } = req.user;
  if (!["owner","admin"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
  const { id, ...updates } = req.body;
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, tenant_id },
      { $set: updates },
      { new: true }
    ).lean();
    if (!invoice) return res.status(404).json({ status: false, message: ["Not found"] });
    return res.status(200).json({ status: true, data: invoice });
  } catch (err) {
    return res.status(500).json({ status: false, message: [err.message] });
  }
},

deleteInvoice: async (req, res) => {
  const { tenant_id, role } = req.user;
  if (!["owner","admin"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
  const { id } = req.body;
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, tenant_id },
      { isDeleted: true, status: "cancelled" },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ status: false, message: ["Not found"] });
    return res.status(200).json({ status: true, message: "Invoice deleted" });
  } catch (err) {
    return res.status(500).json({ status: false, message: [err.message] });
  }
}
};
module.exports = invoiceCtrl;