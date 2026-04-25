// controllers/qrTokenController.js
const QrToken = require("../models/qrToken_model");
const Customer = require("../models/customer_model");

const qrTokenCtrl = {
  generateToken: async (req, res) => {
    const { tenant_id } = req.user;
    const { customer_id, session_id, booking_id, type } = req.body;
    if (!customer_id) return res.status(400).json({ status: false, message: ["customer_id required"] });

    const expiresAt = new Date(Date.now() + 15 * 60000); // 15 minutes
    const token = await QrToken.create({
      tenant_id, customer_id, session_id, booking_id,
      type: type || "booking", expiresAt
    });
    return res.status(201).json({ status: true, token: token.token, expiresAt });
  },
  validateToken: async (req, res) => {
    const { token } = req.body;
    const qr = await QrToken.findOne({ token, isUsed: false, isRevoked: false, expiresAt: { $gt: new Date() } });
    if (!qr) return res.status(400).json({ status: false, message: ["Invalid or expired token"] });

    // Optionally mark as used
    qr.isUsed = true;
    qr.usedAt = new Date();
    qr.scannedBy = req.user.id;
    await qr.save();

    return res.status(200).json({ status: true, customer_id: qr.customer_id, session_id: qr.session_id, booking_id: qr.booking_id });
  }
};
module.exports = qrTokenCtrl;