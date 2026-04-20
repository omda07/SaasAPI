const express = require("express");
const Staff = require("../models/staff_model");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const { CLIENT_URL } = process.env;

const staffCtrl = {
  //------------------------------Post---------------------------------------------

  registerStaff: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;

      // 🔐 RBAC
      if (!["owner", "admin"].includes(role)) {
        return res.status(403).json({
          status: false,
          message: ["Forbidden"],
        });
      }

      const {
        name,
        availability,
        daysOff,
        isOff = false,
        service_id,
      } = req.body;

      if (!name || availability === undefined || !daysOff) {
        return res.status(400).json({
          status: false,
          message: ["Missing required fields"],
        });
      }

      // Prevent duplicate name
      const exists = await Staff.findOne({ name, tenant_id });
      if (exists) {
        return res.status(400).json({
          status: false,
          message: ["Staff already exists"],
        });
      }

      const staff = await Staff.create({
        name,
        availability,
        daysOff,
        isOff,
        tenant_id,
        service_id,
      });

      return res.status(201).json({
        status: true,
        data: staff,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: [error.message],
      });
    }
  },

  //------------------------------Get---------------------------------------------

  getStaffById: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { id } = req.body;

      const staff = await Staff.findOne({
        _id: id,
        tenant_id,
      }).populate('tenant_id service_id','-__v').lean();

      if (!staff) {
        return res.status(404).json({
          status: false,
          message: ["Staff not found"],
        });
      }

      return res.status(200).json({
        status: true,
        data: staff,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },

  allStaffs: async (req, res) => {
    try {
      const { tenant_id } = req.user;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [staffs, count] = await Promise.all([
        Staff.find({ tenant_id })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit).populate('tenant_id service_id','-__v')
          .lean(),

        Staff.countDocuments({ tenant_id }),
      ]);

      return res.status(200).json({
        status: true,
        data: staffs,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: err.message,
      });
    }
  },

  //------------------------------Update---------------------------------------------

  updateStaff: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;
      const { id } = req.body;

      if (!["owner", "admin"].includes(role)) {
        return res.status(403).json({
          status: false,
          message: ["Forbidden"],
        });
      }

      const staff = await Staff.findOne({ _id: id, tenant_id });

      if (!staff) {
        return res.status(404).json({
          status: false,
          message: ["Staff not found"],
        });
      }

      // Prevent duplicate name
      if (req.body.name && req.body.name !== staff.name) {
        const exists = await Staff.findOne({
          name: req.body.name,
          tenant_id,
        });

        if (exists) {
          return res.status(400).json({
            status: false,
            message: ["Staff name already exists"],
          });
        }
      }

      Object.assign(staff, req.body);

      await staff.save();

      return res.status(200).json({
        status: true,
        data: staff,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },
  //------------------------------Delete---------------------------------------------

  deleteStaff: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;
      const { id } = req.body;

      if (!["owner", "admin"].includes(role)) {
        return res.status(403).json({
          status: false,
          message: ["Forbidden"],
        });
      }

      const staff = await Staff.findOneAndDelete({
        _id: id,
        tenant_id,
      });

      if (!staff) {
        return res.status(404).json({
          status: false,
          message: ["Staff not found"],
        });
      }

      return res.status(200).json({
        status: true,
        message: ["Staff deleted"],
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },

  deleteStaffById: async (req, res) => {
    const token = req.header("x-auth-token");
    const id = req.body.id;
    try {
      const staff = jwt.verify(token, "privateKey");

      const check = await Staff.findById(ObjectId(id));
      if (check) {
        let result;

        result = await Staff.deleteOne({
          _id: id,
        });
        console.log(result);
        return res.status(202).json({ status: true, message: "Accepted" });
      } else {
        return res.status(404).json({ status: false, message: "Not Found" });
      }
    } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
    }
  },
};

module.exports = staffCtrl;
