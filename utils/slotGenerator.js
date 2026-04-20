const Booking = require("../models/booking_model");
const BlockTime = require("../models/blockTime_model");

const generateSlots = async ({ staff, service, tenant_id, date }) => {
  const day = new Date(date).getDay();

  const schedule = staff.availability.find((d) => d.day === day);
  if (!schedule) return [];

  const duration = service.duration;
  const slots = [];

  const bookings = await Booking.find({
    tenant_id,
    staff_id: staff._id,
    isDeleted: false,
    status: { $in: ["pending", "confirmed"] },
  });

  const blocks = await BlockTime.find({ tenant_id, staff_id: staff._id });

  for (let slot of schedule.slots) {
    let current = new Date(`${date}T${slot.start}`);
    let end = new Date(`${date}T${slot.end}`);

    while (current < end) {
      let slotEnd = new Date(current.getTime() + duration * 60000);

      const isBooked = bookings.some(
        (b) => current < b.endAt && slotEnd > b.startAt
      );

      const isBlocked = blocks.some(
        (b) => current < b.endAt && slotEnd > b.startAt
      );

      if (!isBooked && !isBlocked) {
        slots.push(current);
      }

      current = new Date(current.getTime() + duration * 60000);
    }
  }

  return slots;
};

module.exports = generateSlots;