// controllers/waitlistController.js
const Waitlist = require("../models/waitlist_model");
const Session = require("../models/session_model");

const waitlistCtrl = {
  joinWaitlist: async (req, res) => {
    const { tenant_id } = req.user;
    const { session_id, customer_id } = req.body;
    if (!session_id || !customer_id) return res.status(400).json({ status: false, message: ["Missing fields"] });

    try {
      const session = await Session.findById(session_id);
      if (!session || session.isDeleted || session.status === "cancelled") {
        return res.status(404).json({ status: false, message: ["Session not available"] });
      }
      if (!session.isFull()) return res.status(400).json({ status: false, message: ["Session has available spots, book directly"] });

      const existing = await Waitlist.findOne({ session_id, customer_id });
      if (existing) return res.status(400).json({ status: false, message: ["Already on waitlist"] });

      const position = await Waitlist.countDocuments({ session_id }) + 1;
      const entry = await Waitlist.create({ tenant_id, session_id, customer_id, position });
      return res.status(201).json({ status: true, data: entry });
    } catch (err) {
      return res.status(500).json({ status: false, message: [err.message] });
    }
  },
  leaveWaitlist: async (req, res) => {
    const { tenant_id } = req.user;
    const { session_id, customer_id } = req.body;
    const { id } = req.body; // or use id
    const query = id ? { _id: id, tenant_id } : { session_id, customer_id, tenant_id };
    const entry = await Waitlist.findOneAndUpdate(query, { status: "removed" }, { new: true });
    if (!entry) return res.status(404).json({ status: false, message: ["Not found"] });
    return res.status(200).json({ status: true, message: "Removed from waitlist" });
  }
};
module.exports = waitlistCtrl;