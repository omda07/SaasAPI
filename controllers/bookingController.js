const Booking = require("../models/booking_model");
const Service = require("../models/service_model");
const Staff = require("../models/staff_model");
const mongoose = require("mongoose");

const isOverlapping = async ({
  staff_id,
  tenant_id,
  startAt,
  endAt,
  excludeId = null,
}) => {
  return await Booking.findOne({
    staff_id,
    tenant_id,
    _id: excludeId ? { $ne: excludeId } : { $exists: true },
    status: { $in: ["pending", "confirmed"] },
    $or: [
      { startAt: { $lt: new Date(endAt), $gte: new Date(startAt) } },
      { endAt: { $gt: new Date(startAt), $lte: new Date(endAt) } },
      {
        startAt: { $lte: new Date(startAt) },
        endAt: { $gte: new Date(endAt) },
      },
    ],
  });
};
const bookingCtrl = {
  // CREATE a new booking
  createBooking: async (req, res) => {
    try {
      const { tenant_id, id: user_id } = req.user;

      const {
        service_id,
        staff_id,
        startAt,
        endAt,
        customer,
        notes,
        timezone,
        payment,
      } = req.body;

      // ✅ validation
      if (!service_id || !staff_id || !startAt || !endAt || !customer?.name) {
        return res.status(400).json({
          status: false,
          message: ["Missing required fields"],
        });
      }

      if (new Date(startAt) >= new Date(endAt)) {
        return res.status(400).json({
          status: false,
          message: ["startAt must be before endAt"],
        });
      }

      // ✅ check staff exists in same tenant
      const staff = await Staff.findOne({ _id: staff_id, tenant_id });
      if (!staff) {
        return res.status(404).json({
          status: false,
          message: ["Staff not found"],
        });
      }

      // ✅ check service exists in same tenant
      const service = await Service.findOne({ _id: service_id, tenant_id });
      if (!service) {
        return res.status(404).json({
          status: false,
          message: ["Service not found"],
        });
      }

      // 🔥 overlap check
      const overlap = await Booking.findOne({
        staff_id,
        tenant_id,
        status: { $in: ["pending", "confirmed"] },
        $or: [
          { startAt: { $lt: new Date(endAt), $gte: new Date(startAt) } },
          { endAt: { $gt: new Date(startAt), $lte: new Date(endAt) } },
          {
            startAt: { $lte: new Date(startAt) },
            endAt: { $gte: new Date(endAt) },
          },
        ],
      });

      if (overlap) {
        return res.status(400).json({
          status: false,
          message: ["Staff already booked in this time slot"],
        });
      }

      const booking = await Booking.create({
        tenant_id,
        service_id,
        staff_id,
        user_id,
        startAt,
        endAt,
        duration: service.duration,
        price: service.price,
        customer,
        notes,
        timezone,
        payment,
      });

      return res.status(201).json({
        status: true,
        data: booking,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: [error.message],
      });
    }
  },

  // GET all bookings for tenant
  getAllBookings: async (req, res) => {
    try {
      const { tenant_id } = req.user;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [bookings, count] = await Promise.all([
        Booking.find({ tenant_id, isDeleted: false })
          .sort({ startAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("staff_id", "name")
          .populate("service_id", "name price duration")
          .lean(),

        Booking.countDocuments({ tenant_id, isDeleted: false }),
      ]);

      return res.status(200).json({
        status: true,
        data: bookings,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: [error.message],
      });
    }
  },

  // GET booking by ID
  getBookingById: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { id } = req.body;

      const booking = await Booking.findOne({
        _id: id,
        tenant_id,
        isDeleted: false,
      })
        .populate("staff_id", "name")
        .populate("service_id", "name price duration")
        .populate("user_id", "name email")
        .lean();

      if (!booking) {
        return res.status(404).json({
          status: false,
          message: ["Booking not found"],
        });
      }

      return res.status(200).json({
        status: true,
        data: booking,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: [error.message],
      });
    }
  },

  // UPDATE booking
  updateBooking: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { id } = req.body;

      const booking = await Booking.findOne({
        _id: id,
        tenant_id,
        isDeleted: false,
      });

      if (!booking) {
        return res.status(404).json({
          status: false,
          message: ["Booking not found"],
        });
      }

      const { startAt, endAt, status, notes, payment } = req.body;

      // 🔥 time update check
      if (startAt && endAt) {
        if (new Date(startAt) >= new Date(endAt)) {
          return res.status(400).json({
            status: false,
            message: ["Invalid time range"],
          });
        }

        const overlap = await Booking.findOne({
          staff_id: booking.staff_id,
          tenant_id,
          _id: { $ne: booking._id },
          status: { $in: ["pending", "confirmed"] },
          $or: [
            { startAt: { $lt: new Date(endAt), $gte: new Date(startAt) } },
            { endAt: { $gt: new Date(startAt), $lte: new Date(endAt) } },
            {
              startAt: { $lte: new Date(startAt) },
              endAt: { $gte: new Date(endAt) },
            },
          ],
        });

        if (overlap) {
          return res.status(400).json({
            status: false,
            message: ["Time slot already booked"],
          });
        }

        booking.startAt = startAt;
        booking.endAt = endAt;
      }

      if (status) booking.status = status;
      if (notes) booking.notes = notes;
      if (payment) booking.payment = payment;

      await booking.save();

      return res.status(200).json({
        status: true,
        data: booking,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: [error.message],
      });
    }
  },

  // DELETE booking (soft delete)
  deleteBooking: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { id } = req.body;

      const booking = await Booking.findOne({
        _id: id,
        tenant_id,
        isDeleted: false,
      });

      if (!booking) {
        return res.status(404).json({
          status: false,
          message: ["Booking not found"],
        });
      }

      booking.isDeleted = true;
      booking.status = "cancelled";

      await booking.save();

      return res.status(200).json({
        status: true,
        message: ["Booking cancelled successfully"],
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: [error.message],
      });
    }
  },
};
/**
 * 🔥 I recommend next:
Availability slots generator
Calendar weekly view API
Auto duration → endAt calculation
Notification system (WhatsApp / SMS)
Stripe payments
 */
module.exports = bookingCtrl;
