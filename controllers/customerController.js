const Customer = require("../models/customer_model");

const customerCtrl = {
  // Create customer
  createCustomer: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { name, phone, email } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ status: false, message: ["Name and phone required"] });
      }
      const existing = await Customer.findOne({ phone, tenant_id });
      if (existing) {
        return res.status(400).json({ status: false, message: ["Customer already exists"] });
      }
      const customer = await Customer.create({ tenant_id, name, phone, email });
      return res.status(201).json({ status: true, data: customer });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  // Get all customers (paginated)
  getAllCustomers: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [customers, count] = await Promise.all([
        Customer.find({ tenant_id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Customer.countDocuments({ tenant_id })
      ]);
      return res.status(200).json({
        status: true,
        data: customers,
        pagination: { total: count, page, totalPages: Math.ceil(count / limit) }
      });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  // Get customer by ID
  getCustomerById: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { id } = req.body;
      const customer = await Customer.findOne({ _id: id, tenant_id }).lean();
      if (!customer) return res.status(404).json({ status: false, message: ["Not found"] });
      return res.status(200).json({ status: true, data: customer });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  // Update customer
  updateCustomer: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { id, ...updates } = req.body;
      const customer = await Customer.findOneAndUpdate(
        { _id: id, tenant_id },
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();
      if (!customer) return res.status(404).json({ status: false, message: ["Not found"] });
      return res.status(200).json({ status: true, data: customer });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  // Delete customer
  deleteCustomer: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { id } = req.body;
      const customer = await Customer.findOneAndDelete({ _id: id, tenant_id });
      if (!customer) return res.status(404).json({ status: false, message: ["Not found"] });
      return res.status(200).json({ status: true, message: "Deleted" });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  }
};

module.exports = customerCtrl;