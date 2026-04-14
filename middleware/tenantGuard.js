module.exports = (req, res, next) => {
  if (!req.user?.tenant_id) {
    return res
      .status(403)
      .json({ status: false, message: "Tenant not assigned" });
  }
  req.tenant_id = req.user.tenant_id;
  next();
};
