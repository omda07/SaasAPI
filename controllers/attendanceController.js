// controllers/attendanceController.js
const Attendance = require("../models/attendance_model");
const QrToken = require("../models/qrToken_model");

const attendanceCtrl = {
  // Manual or QR check-in
  checkIn: async (req, res) => {
    const { tenant_id } = req.user;
    const { customer_id, session_id, booking_id, service_id, staff_id, method } = req.body;
    if (!customer_id) return res.status(400).json({ status: false, message: ["customer_id required"] });
    if (!session_id && !booking_id) return res.status(400).json({ status: false, message: ["session_id or booking_id required"] });

    try {
      // Check duplicate
      const existing = await Attendance.findOne({
        tenant_id, customer_id,
        $or: [{ session_id: session_id || undefined }, { booking_id: booking_id || undefined }]
      });
      if (existing) return res.status(400).json({ status: false, message: ["Already checked in"] });

      const attendance = await Attendance.create({
        tenant_id, customer_id, session_id, booking_id,
        service_id, staff_id, checkInAt: new Date(),
        status: "present", checkInMethod: method || "manual"
      });
      return res.status(201).json({ status: true, data: attendance });
    } catch (err) {
      return res.status(500).json({ status: false, message: [err.message] });
    }
  },
  // Get attendance list
  getAttendance: async (req, res) => {
    const { tenant_id } = req.user;
    const { session_id, booking_id, date } = req.query;
    const filter = { tenant_id };
    if (session_id) filter.session_id = session_id;
    if (booking_id) filter.booking_id = booking_id;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate()+1);
      filter.checkInAt = { $gte: start, $lt: end };
    }
    const records = await Attendance.find(filter).populate("customer_id","name").lean();
    return res.status(200).json({ status: true, data: records });
  }
};
module.exports = attendanceCtrl;