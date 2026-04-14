const jwt = require("jsonwebtoken");

module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token)
      return res.status(401).json({ status: false, message: "No token" });

    try {
      const decoded = jwt.verify(token, "privateKey");
      req.user = decoded;

      if (!allowedRoles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ status: false, message: "Access denied" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ status: false, message: "Invalid token" });
    }
  };
};
