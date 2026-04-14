const express = require("express");
const Tenant = require("../models/tenant_model");
const Users = require("../models/user");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


const tenantCtrl = {

  //------------------------------Post---------------------------------------------

  registerTenant: async (req, res) => {

    const {
      name,
      logo,
      primaryColor,
      workingHours
    } = req.body;


    let tenant = await Tenant.findOne({ name }).lean();

    //* if exist return an error messge
    if (tenant) {
      return res
        .status(400)
        .json({ status: false, message: ["Name already used"] });
    }
    try {
      //* take from tenant tenantName , email and password and not care for any value else
      tenant = new Tenant(_.pick(req.body, ["name"]));


      //* then save the tenant
      await tenant.save();

      console.log(tenant);

      return res.status(200).json({
        status: true,
        message: ["Register Success"],
        id: tenant._id,
        name: tenant.userName,
      });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },
  //------------------------------Get---------------------------------------------
getTenantById: async (req, res) => {
  try {
    let tenantId = req.body.tenantId;
    const token = req.header("x-auth-token");

    const decoded = jwt.verify(token, "privateKey");

    const user = await Users.findById(decoded.id);

    const tenant = await Tenant.findById(tenantId)
      .select("-password -__v");

    if (!tenant) {
      return res.status(404).json({
        status: false,
        message: "Tenant not found",
      });
    }

    // 🔐 Tenant isolation
    if (user.tenant_id.toString() !== tenant._id.toString()) {
      return res.status(403).json({
        status: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Get tenant success",
      tenant,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
},
allTenants: async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    const decoded = jwt.verify(token, "privateKey");

    const user = await Users.findById(decoded.id);

    // 🔐 Only system owner (not tenant owner)
    if (user.role !== "owner") {
      return res.status(403).json({
        status: false,
        message: "Forbidden",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [tenants, count] = await Promise.all([
      Tenant.find()
        .select("-password -__v")
        .skip(skip)
        .limit(limit)
        .lean(),

      Tenant.countDocuments(),
    ]);

    return res.status(200).json({
      status: true,
      tenants,
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
updateTenant: async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    const decoded = jwt.verify(token, "privateKey");

    const user = await Users.findById(decoded.id);

    // 🔐 Only owner can update tenant
    if (user.role !== "owner") {
      return res.status(403).json({
        status: false,
        message: "Only owner can update tenant",
      });
    }

    const updateFields = {};

    if (req.body.name) updateFields.name = req.body.name;
    if (req.body.logo) updateFields.logo = req.body.logo;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        status: false,
        message: "No valid fields provided",
      });
    }

    const tenant = await Tenant.findByIdAndUpdate(
      user.tenant_id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      status: true,
      message: "Tenant updated",
      tenant,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
},
deleteTenant: async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    const decoded = jwt.verify(token, "privateKey");

    const user = await Users.findById(decoded.id);

    // 🔐 Only owner can delete tenant
    if (user.role !== "owner") {
      return res.status(403).json({
        status: false,
        message: "Only owner can delete tenant",
      });
    }

    // 🚨 Optional: prevent deleting if users exist
    const usersCount = await Users.countDocuments({
      tenantId: user.tenant_id,
    });

    if (usersCount > 1) {
      return res.status(400).json({
        status: false,
        message: "Cannot delete tenant with active users",
      });
    }

    await Tenant.findByIdAndDelete(user.tenant_id);

    return res.status(200).json({
      status: true,
      message: "Tenant deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
},
};


module.exports = tenantCtrl;
