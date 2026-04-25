const rateLimit = require("express-rate-limit");

// Strict limiter for login / register — 10 attempts per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: false, message: "Too many attempts, please try again later" },
});

// General API limiter — 200 req per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: false, message: "Too many requests, slow down" },
});

// QR scan limiter — prevent brute-force token scanning
const scanLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: false, message: "Too many scan attempts" },
});

module.exports = { authLimiter, apiLimiter, scanLimiter };