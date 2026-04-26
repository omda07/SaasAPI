const bcrypt = require("bcryptjs");
const Users = require("../models/user");
const Tenants = require("../models/tenant_model");
const jwt = require("jsonwebtoken");
const { validateUser, validateUserLogin } = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET || "privateKey";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, tenant_id: user.tenant_id, isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES } // FIX: was missing expiresIn entirely
  );

const userCtrl = {

  register: async (req, res) => {
    const { userName, password: plainTextPassword, tenant_id } = req.body;

    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({ status: false, message: error.details.map((d) => d.message) });
    }

    // FIX: was Tenants.findOne({ tenant_id }) which is wrong — it searches the `tenant_id` field on Tenant docs
    const tenant = await Tenants.findById(tenant_id).lean();
    if (!tenant) {
      return res.status(400).json({ status: false, message: ["Invalid tenant"] });
    }

    const existingUser = await Users.findOne({ userName, tenant_id }).lean();
    if (existingUser) {
      return res.status(400).json({ status: false, message: ["Username already exists in this tenant"] });
    }

    try {
      const user = new Users({
        userName,
        tenant_id,
        role: req.body.role || "customer",
        language: req.body.language,
        currency: req.body.currency,
        password: await bcrypt.hash(plainTextPassword, 10),
      });

      await user.save();
      const token = signToken(user);

      return res.status(201).json({
        status: true,
        message: "Register success",
        token,
        user: { id: user._id, userName: user.userName, role: user.role, tenant_id: user.tenant_id },
      });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  login: async (req, res) => {
    const { userName, password: plainTextPassword, tenant_id } = req.body;

    const { error } = validateUserLogin(req.body);
    if (error) {
      return res.status(400).json({ status: false, message: error.details.map((d) => d.message) });
    }

    if (!tenant_id) {
      return res.status(400).json({ status: false, message: ["tenant_id is required"] });
    }

    try {
      const user = await Users.findOne({ userName, tenant_id }).lean();
      if (!user) {
        return res.status(400).json({ status: false, message: ["Invalid username or tenant"] });
      }

      const match = await bcrypt.compare(plainTextPassword, user.password);
      if (!match) {
        return res.status(400).json({ status: false, message: ["Invalid username or password"] });
      }

      const token = signToken(user);

      return res.status(200).json({
        status: true,
        message: "Login success",
        user:user,
        token,
        role: user.role,
        language: user.language,
        currency: user.currency,
        tenant_id: user.tenant_id,
      });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  loginAdmin: async (req, res) => {
    const { userName, password: plainTextPassword, tenant_id } = req.body;

    const { error } = validateUserLogin(req.body);
    if (error) {
      return res.status(400).json({ status: false, message: error.details.map((d) => d.message) });
    }

    try {
      const user = await Users.findOne({ userName, tenant_id }).lean();
      if (!user) {
        return res.status(400).json({ status: false, message: ["Invalid username"] });
      }

      if (!["admin", "owner"].includes(user.role)) {
        return res.status(403).json({ status: false, message: ["Not authorized"] });
      }

      const match = await bcrypt.compare(plainTextPassword, user.password);
      if (!match) {
        return res.status(400).json({ status: false, message: ["Invalid password"] });
      }

      // FIX: was missing role and tenant_id in admin token
      const token = signToken(user);

      return res.status(200).json({ status: true, message: "Login success", token, isAdmin: user.isAdmin });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  profile: async (req, res) => {
    try {
      // FIX: was re-verifying token manually — auth middleware already sets req.user
      const profile = await Users.findById(req.user.id).select("-password -__v");
      if (!profile) return res.status(404).json({ status: false, message: ["User not found"] });
      return res.status(200).json({ status: true, profile });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  getUserId: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password -__v");
      if (!user) return res.status(404).json({ status: false, message: ["User not found"] });
      return res.status(200).json({ status: true, user });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  allUsers: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;

      // FIX: was returning ALL users across all tenants — must scope to tenant
      // Only super-admins (no tenant) can see all users
      const filter = role === "owner" && !tenant_id ? {} : { tenant_id };

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [users, count] = await Promise.all([
        Users.find(filter).select("-password -__v").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Users.countDocuments(filter),
      ]);

      return res.status(200).json({
        status: true,
        users,
        pagination: { total: count, page, totalPages: Math.ceil(count / limit) },
      });
    } catch (err) {
      return res.status(500).json({ status: false, message: [err.message] });
    }
  },

  getUser: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const search = req.query.search || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const filter = { tenant_id };
      if (search.trim()) {
        filter.$or = [
          { userName: { $regex: search, $options: "i" } },
        ];
      }

      const [users, count] = await Promise.all([
        Users.find(filter).select("-password -__v").skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
        Users.countDocuments(filter),
      ]);

      return res.status(200).json({
        status: true,
        data: { users, pagination: { total: count, page, totalPages: Math.ceil(count / limit) } },
      });
    } catch (err) {
      return res.status(500).json({ status: false, message: [err.message] });
    }
  },

  getUserCount: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      // FIX: was using deprecated Users.count() and not scoping to tenant
      const count = await Users.countDocuments({ tenant_id });
      return res.status(200).json({ status: true, count });
    } catch (err) {
      return res.status(500).json({ status: false, message: [err.message] });
    }
  },

  changePassword: async (req, res) => {
    const { oldPassword, password: newPlainPassword } = req.body;

    if (!newPlainPassword || newPlainPassword.length < 8) {
      return res.status(400).json({ status: false, message: ["Password must be at least 8 characters"] });
    }

    try {
      // FIX: was re-verifying token — use req.user from middleware
      const user = await Users.findById(req.user.id);
      if (!user) return res.status(404).json({ status: false, message: ["User not found"] });

      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) return res.status(400).json({ status: false, message: ["Old password is incorrect"] });

      user.password = await bcrypt.hash(newPlainPassword, 10);
      await user.save();

      return res.status(200).json({ status: true, message: "Password changed" });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  updatePreferences: async (req, res) => {
    const { language, currency } = req.body;

    try {
      // FIX: was missing `await` on findById — check was always a Promise (truthy), never checked the actual user
      const user = await Users.findById(req.user.id);
      if (!user) return res.status(404).json({ status: false, message: ["User not found"] });

      if (language) user.language = language;
      if (currency) user.currency = currency;
      await user.save();

      return res.status(200).json({ status: true, message: "Preferences updated" });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const updateFields = {};
      if (req.body.userName) updateFields.userName = req.body.userName.trim().toLowerCase();
      if (req.body.noId) updateFields.noId = req.body.noId;

      if (!Object.keys(updateFields).length) {
        return res.status(400).json({ status: false, message: ["No valid fields to update"] });
      }

      const updatedUser = await Users.findByIdAndUpdate(
        req.user.id,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select("-password -__v");

      return res.status(200).json({ status: true, message: "Profile updated", user: updatedUser });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  changeRole: async (req, res) => {
    try {
      const { id, role } = req.body;

      const requester = await Users.findById(req.user.id);
      if (!requester || requester.role !== "owner") {
        return res.status(403).json({ status: false, message: ["Only owner can change roles"] });
      }

      const targetUser = await Users.findById(id);
      if (!targetUser) return res.status(404).json({ status: false, message: ["User not found"] });

      // FIX: was checking cross-tenant AFTER using targetUser (would throw if null)
      if (requester.tenant_id.toString() !== targetUser.tenant_id.toString()) {
        return res.status(403).json({ status: false, message: ["Cross-tenant access denied"] });
      }

      const allowedRoles = ["owner", "admin", "staff", "customer"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ status: false, message: ["Invalid role"] });
      }

      const updated = await Users.findByIdAndUpdate(id, { $set: { role } }, { new: true }).select("-password -__v");
      return res.status(200).json({ status: true, message: "Role updated", user: updated });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  deleteUser: async (req, res) => {
    try {
      await Users.findByIdAndDelete(req.user.id);
      return res.status(200).json({ status: true, message: "Account deleted" });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  deleteUserById: async (req, res) => {
    try {
      const { id } = req.body;
      const requester = await Users.findById(req.user.id);

      if (!["admin", "owner"].includes(requester.role)) {
        return res.status(403).json({ status: false, message: ["Insufficient permissions"] });
      }

      const target = await Users.findById(id);
      if (!target) return res.status(404).json({ status: false, message: ["User not found"] });

      if (requester.tenant_id.toString() !== target.tenant_id.toString()) {
        return res.status(403).json({ status: false, message: ["Cross-tenant deletion not allowed"] });
      }

      if (requester._id.toString() === id) {
        return res.status(400).json({ status: false, message: ["Cannot delete your own account"] });
      }

      await Users.findByIdAndDelete(id);
      return res.status(200).json({ status: true, message: "User deleted" });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
};

module.exports = userCtrl;