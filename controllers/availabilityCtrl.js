const Staff = require("../models/staff_model");
const Service = require("../models/service_model");
const Booking = require("../models/booking_model");
const BlockTime = require("../models/blockTime_model");
const generateSlots = require("../utils/slotGenerator");

const availabilityCtrl = {
  getAvailability: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { staff_id, service_id, date } = req.query;

      if (!staff_id || !service_id || !date) {
        return res.status(400).json({
          status: false,
          message: ["Missing parameters"],
        });
      }
      const blocks = await BlockTime.find({ staff_id, tenant_id });

      const isBlocked = blocks.some(
        (b) => current < b.endAt && slotEnd > b.startAt,
      );
      const staff = await Staff.findOne({ _id: staff_id, tenant_id });
      const service = await Service.findOne({ _id: service_id, tenant_id });

      if (!staff || !service || isBlocked) {
        return res.status(404).json({
          status: false,
          message: ["Staff or Service not found"],
        });
      }

      if (staff.isOff) {
        return res.status(200).json({
          status: true,
          slots: [],
        });
      }

      const slots = await generateSlots({
        staff,
        service,
        tenant_id,
        date,
      });

      return res.status(200).json({
        status: true,
        slots,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: [error.message],
      });
    }
  },
  getCalendar: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { from, to } = req.query;

      const bookings = await Booking.find({
        tenant_id,
        isDeleted: false,
        startAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
      }).lean();

      const grouped = {};

      bookings.forEach((b) => {
        const day = b.startAt.toISOString().split("T")[0];

        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(b);
      });

      return res.status(200).json({
        status: true,
        data: grouped,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },
  getOverview: async (req, res) => {
    try {
      const { tenant_id } = req.user;

      const [total, revenue, cancelled] = await Promise.all([
        Booking.countDocuments({ tenant_id, isDeleted: false }),

        Booking.aggregate([
          { $match: { tenant_id, "payment.status": "paid" } },
          { $group: { _id: null, total: { $sum: "$price" } } },
        ]),

        Booking.countDocuments({
          tenant_id,
          status: "cancelled",
        }),
      ]);

      return res.status(200).json({
        status: true,
        data: {
          totalBookings: total,
          revenue: revenue[0]?.total || 0,
          cancelled,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },
};

module.exports = availabilityCtrl;
