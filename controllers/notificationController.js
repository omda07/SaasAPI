// controllers/notificationController.js
const Notification = require("../models/notification_model");

const notificationCtrl = {
  sendManualNotification: async (req, res) => {
    const { tenant_id, role } = req.user;
    if (!["owner","admin"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
    try {
      const notif = await Notification.create({ ...req.body, tenant_id });
      // In production, trigger actual delivery here
      return res.status(201).json({ status: true, data: notif });
    } catch (err) {
      return res.status(500).json({ status: false, message: [err.message] });
    }
  },
  getNotifications: async (req, res) => {
    const { tenant_id } = req.user;
    const filter = { tenant_id };
    if (req.query.status) filter.status = req.query.status;
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ status: true, data: notifications });
  },
  getNotificationById: async (req, res) => {
  const { tenant_id } = req.user;
  const { id } = req.body;
  try {
    const notification = await Notification.findOne({ _id: id, tenant_id }).lean();
    if (!notification) return res.status(404).json({ status: false, message: ["Not found"] });
    return res.status(200).json({ status: true, data: notification });
  } catch (err) {
    return res.status(500).json({ status: false, message: [err.message] });
  }
}
};
module.exports = notificationCtrl;