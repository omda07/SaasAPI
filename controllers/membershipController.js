const Membership = require("../models/membership_model");
const MembershipPlan = require("../models/membershipPlan_model");

const membershipCtrl = {
  createMembership: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { customer_id, plan_id, startDate } = req.body;
      if (!customer_id || !plan_id) return res.status(400).json({ status: false, message: ["Missing fields"] });
      const plan = await MembershipPlan.findOne({ _id: plan_id, tenant_id });
      if (!plan) return res.status(404).json({ status: false, message: ["Plan not found"] });
      const start = startDate ? new Date(startDate) : new Date();
      const end = new Date(start.getTime() + (plan.durationDays || 30) * 86400000);
      const membership = await Membership.create({
        tenant_id, customer_id, plan_id,
        startDate: start, endDate: end,
        totalSessions: plan.sessionCount,
        remainingSessions: plan.sessionCount
      });
      return res.status(201).json({ status: true, data: membership });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
  getMemberships: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { customer_id, status } = req.query;
      const filter = { tenant_id };
      if (customer_id) filter.customer_id = customer_id;
      if (status) filter.status = status;
      const memberships = await Membership.find(filter)
        .populate("customer_id","name phone")
        .populate("plan_id","name type")
        .lean();
      return res.status(200).json({ status: true, data: memberships });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
  // Pause / cancel / etc.
  cancelMembership: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { id } = req.body;
      const membership = await Membership.findOneAndUpdate(
        { _id: id, tenant_id },
        { status: "cancelled" },
        { new: true }
      );
      if (!membership) return res.status(404).json({ status: false, message: ["Not found"] });
      return res.status(200).json({ status: true, data: membership });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  }
};
module.exports = membershipCtrl;