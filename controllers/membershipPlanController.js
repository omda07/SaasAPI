const MembershipPlan = require("../models/membershipPlan_model");

const planCtrl = {
  createPlan: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;
      if (!["owner","admin"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
      const plan = await MembershipPlan.create({ ...req.body, tenant_id });
      return res.status(201).json({ status: true, data: plan });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
  getPlans: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const plans = await MembershipPlan.find({ tenant_id, isActive: true }).lean();
      return res.status(200).json({ status: true, data: plans });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
  updatePlan: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;
      if (!["owner","admin"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
      const { id, ...updates } = req.body;
      const plan = await MembershipPlan.findOneAndUpdate({ _id: id, tenant_id }, { $set: updates }, { new: true });
      if (!plan) return res.status(404).json({ status: false, message: ["Not found"] });
      return res.status(200).json({ status: true, data: plan });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
  deletePlan: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;
      if (!["owner","admin"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
      const { id } = req.body;
      const plan = await MembershipPlan.findOneAndUpdate({ _id: id, tenant_id }, { isActive: false }, { new: true });
      if (!plan) return res.status(404).json({ status: false, message: ["Not found"] });
      return res.status(200).json({ status: true, message: "Plan deactivated" });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  }
};
module.exports = planCtrl;