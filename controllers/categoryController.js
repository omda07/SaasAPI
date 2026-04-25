const Category = require("../models/category_model");

const categoryCtrl = {
  createCategory: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;
      if (!["owner","admin"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
      const { name, description, icon, color, order } = req.body;
      if (!name) return res.status(400).json({ status: false, message: ["Name required"] });
      const exists = await Category.findOne({ name, tenant_id });
      if (exists) return res.status(400).json({ status: false, message: ["Category exists"] });
      const category = await Category.create({ tenant_id, name, description, icon, color, order });
      return res.status(201).json({ status: true, data: category });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
  getAllCategories: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const categories = await Category.find({ tenant_id, isActive: true }).sort({ order: 1 }).lean();
      return res.status(200).json({ status: true, data: categories });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
  getCategoryById: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { id } = req.body;
      const category = await Category.findOne({ _id: id, tenant_id }).lean();
      if (!category) return res.status(404).json({ status: false, message: ["Not found"] });
      return res.status(200).json({ status: true, data: category });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
  updateCategory: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;
      if (!["owner","admin"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
      const { id, ...updates } = req.body;
      if (updates.name) {
        const dup = await Category.findOne({ name: updates.name, tenant_id, _id: { $ne: id } });
        if (dup) return res.status(400).json({ status: false, message: ["Name exists"] });
      }
      const category = await Category.findOneAndUpdate({ _id: id, tenant_id }, { $set: updates }, { new: true });
      if (!category) return res.status(404).json({ status: false, message: ["Not found"] });
      return res.status(200).json({ status: true, data: category });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;
      if (!["owner","admin"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
      const { id } = req.body;
      const category = await Category.findOneAndUpdate({ _id: id, tenant_id }, { isActive: false }, { new: true });
      if (!category) return res.status(404).json({ status: false, message: ["Not found"] });
      return res.status(200).json({ status: true, message: "Category deactivated" });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  }
};
module.exports = categoryCtrl;