const express = require("express");

const sendNotification = async (booking) => {
  console.log("📢 Sending notification...");
  console.log(`Booking for ${booking.customer.name} at ${booking.startAt}`);

  // 🔥 later:
  // - WhatsApp API
  // - Email (nodemailer)
  // - SMS (Twilio)
};

module.exports = sendNotification;