const Session = require("../models/session_model");
const Service = require("../models/service_model");
const Staff = require("../models/staff_model");

const sessionCtrl = {
  createSession: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;
      if (!["owner","admin"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
      const { service_id, staff_id, startAt, endAt, capacity, price, location, notes, isRecurring, recurrence } = req.body;
      if (!service_id || !staff_id || !startAt || !endAt || !capacity) {
        return res.status(400).json({ status: false, message: ["Missing required fields"] });
      }
      const service = await Service.findOne({ _id: service_id, tenant_id });
      if (!service) return res.status(404).json({ status: false, message: ["Service not found"] });
      const session = await Session.create({
        tenant_id, service_id, staff_id, startAt, endAt,
        duration: (new Date(endAt) - new Date(startAt)) / 60000,
        capacity, price: price || service.price,
        location, notes, isRecurring, recurrence
      });
      return res.status(201).json({ status: true, data: session });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
  getSessions: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { from, to, service_id, staff_id } = req.query;
      const filter = { tenant_id, isDeleted: false };
      if (from) filter.startAt = { $gte: new Date(from) };
      if (to)   filter.endAt   = { ...filter.endAt, $lte: new Date(to) };
      if (service_id) filter.service_id = service_id;
      if (staff_id)   filter.staff_id   = staff_id;

      const sessions = await Session.find(filter)
        .populate("service_id","name duration")
        .populate("staff_id","name")
        .sort({ startAt: 1 }).lean();
      return res.status(200).json({ status: true, data: sessions });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
  updateSession: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;
      if (!["owner","admin"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
      const { id, ...updates } = req.body;
      const session = await Session.findOneAndUpdate({ _id: id, tenant_id }, { $set: updates }, { new: true });
      if (!session) return res.status(404).json({ status: false, message: ["Not found"] });
      return res.status(200).json({ status: true, data: session });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
  cancelSession: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;
      if (!["owner","admin"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
      const { id } = req.body;
      const session = await Session.findOneAndUpdate({ _id: id, tenant_id }, { status: "cancelled", isDeleted: true }, { new: true });
      if (!session) return res.status(404).json({ status: false, message: ["Not found"] });
      return res.status(200).json({ status: true, message: "Session cancelled" });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  }
};
module.exports = sessionCtrl;