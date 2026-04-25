// Place this LAST in app.js: app.use(errorHandler)
// Catches anything thrown or passed to next(err)

module.exports = function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ status: false, message: messages });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ status: false, message: [`${field} already exists`] });
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({ status: false, message: ["Invalid ID format"] });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ status: false, message: ["Invalid or expired token"] });
  }

  // Default
  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    status: false,
    message: [err.message || "Internal server error"],
  });
};