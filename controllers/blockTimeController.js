const BlockTime = require("../models/blockTime_model");

const blockTimeCtrl = {
  createBlock: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;
      if (!["owner","admin"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
      const { staff_id, startAt, endAt, reason } = req.body;
      if (!staff_id || !startAt || !endAt) return res.status(400).json({ status: false, message: ["Missing fields"] });

      // Validate times and overlap (optional but recommended)
      const block = await BlockTime.create({ tenant_id, staff_id, startAt, endAt, reason });
      return res.status(201).json({ status: true, data: block });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
  getBlocks: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { staff_id, from, to } = req.query;
      const filter = { tenant_id };
      if (staff_id) filter.staff_id = staff_id;
      if (from && to) {
        filter.startAt = { $gte: new Date(from), $lte: new Date(to) };
      }
      const blocks = await BlockTime.find(filter).populate("staff_id", "name").lean();
      return res.status(200).json({ status: true, data: blocks });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
  deleteBlock: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { id } = req.body;
      const block = await BlockTime.findOneAndDelete({ _id: id, tenant_id });
      if (!block) return res.status(404).json({ status: false, message: ["Not found"] });
      return res.status(200).json({ status: true, message: "Deleted" });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  }
};
module.exports = blockTimeCtrl;