// controllers/tenantPlanController.js
const TenantPlan = require("../models/tenantPlan_model");

const tenantPlanCtrl = {
  getCurrentPlan: async (req, res) => {
    const { tenant_id } = req.user;
    const plan = await TenantPlan.findOne({ tenant_id });
    return res.status(200).json({ status: true, data: plan });
  },
  upgradePlan: async (req, res) => {
    // Requires payment integration (Stripe). For now, just update limits manually (admin only).
    const { tenant_id, role } = req.user;
    if (role !== "owner") return res.status(403).json({ status: false, message: ["Forbidden"] });
    const { plan, limits } = req.body;
    const tp = await TenantPlan.findOneAndUpdate(
      { tenant_id },
      { $set: { plan, limits, status: "active" } },
      { new: true, upsert: true }
    );
    return res.status(200).json({ status: true, data: tp });
  }
};
module.exports = tenantPlanCtrl;