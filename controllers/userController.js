const express = require("express");
const bcrypt = require("bcryptjs");
const Users = require("../models/user");
const Tenants = require("../models/tenant_model");
const jwt = require("jsonwebtoken");
const { validateUser } = require("../models/user");
const _ = require("lodash");
const { validateUserLogin } = require("../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const { CLIENT_URL } = process.env;

const userCtrl = {
  getUserId: async (req, res) => {
     const token = req.header("x-auth-token");
    try {
        const userToken = jwt.verify(token, "privateKey");
      console.log(userToken);
      const id = userToken.id;
      console.log(id);

      //* find the user info by his id and not show the password in response

      const user = await Users.findById(id)

        .select("-password -__v ");
      console.log(req.params.id);
      console.log(user);
      return res
        .status(200)
        .json({ status: true, message: "Get user success", profile: user });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: error.message });
    }
  },

  register: async (req, res) => {
    //* take the inputs from user and validate them
    //* register by phone or userName just change email below to phone or userName
    const { userName, password: plainTextPassword, tenant_id } = req.body;
    // console.log(userName.replace(/\s+/g, ''))
    //   let userNameCheck =userName.replace(/\s+/g, '')

    const validateError = validateUser(req.body);

    //* if validate error just send to user an error message
    let errors = [];

    if (validateError.error) {
      for (i = 0; i < validateError.error.details.length; i++) {
        errors[i] = validateError.error.details[i].message;
      }
      console.log(errors);
      console.log(validateError.error);
      return res.status(400).json({
        status: false,
        message: errors[0],
      });
    }

    //* check in database by email
    //* register by phone or userName just change email below to phone or userName
    const tenant = await Tenants.findOne({ tenant_id }).lean();

    if (!tenant) {
      return res.status(400).json({
        status: false,
        message: "Invalid tenant",
      });
    }

    // 2. check لو user موجود في نفس الـ tenant
    const existingUser = await Users.findOne({
      userName,
      tenant_id,
    }).lean();

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "UserName already exists in this tenant",
      });
    }
    try {
      //* take from user userName , email and password and not care for any value else
   const   user = new Users(
        _.pick(req.body, [
          "userName",
          "password",
          "language",
          "currency",
          "tenant_id",
          "role",
        ]),
      );

      //* crypt the password using bcrypt package
      user.password = await bcrypt.hash(plainTextPassword, 10);
      //   user.userName = userNameCheck
      //* generate token that have his id
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
          tenant_id: user.tenant_id,
          isAdmin: user.isAdmin,
        },
        "privateKey",
      );

      //* then save the user
      await user.save();

      console.log(user);

      //* send his token in header and his data in body
      // return res.header('x-auth-token', token).json(_.pick(user, ['_id', 'userName', 'email','phone','token']),token)
      return res.status(200).json({
        status: true,
        message: "Register Success",
        user: {
          id: user._id,
          userName: user.userName,
          role: user.role,
          language: user.language,
          currency: user.currency,
          tenant_id: user.tenant_id,
        },
        token,
      });
    } catch (error) {
      return res.status(500).json({ status: false, message: error.message });
    }
  },

  login: async (req, res) => {
    //* take the inputs from user and validate them
    const { userName, password: plainTextPassword, tenant_id } = req.body;

    const validateError = validateUserLogin(req.body);

    //* if validate error just send to user an error message
    console.log("error", validateError.error);
    let errors = [];

    if (validateError.error) {
      for (i = 0; i < validateError.error.details.length; i++) {
        errors[i] = validateError.error.details[i].message;
      }
      console.log(errors);
      return res.status(400).json({
        status: false,
        message: errors,
      });
    }
    console.log(tenant_id);
    if (!tenant_id) {
      return res.status(400).json({
        status: false,
        message: "Tenant is required",
      });
    }
    //* check in database by email
    let user = await Users.findOne({ userName, tenant_id }).lean();

    //* if not exist return an error messge
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: ["Invalid userName or Tenant"] });
    }

    try {
      //* compare between password and crypted password of user
      const checkPassword = await bcrypt.compare(
        req.body.password,
        user.password,
      );
      console.log(checkPassword);
      //* if password doesnt match return to user an error message
      if (!checkPassword) {
        return res
          .status(400)
          .json({ status: false, message: ["Invalid userName or password"] });
      }

      //* generate token that have his id and if admin or not
      //  const token= createAccessToken(  { id: user._id, isAdmin: user.isAdmin })
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
          tenant_id: user.tenant_id,
          isAdmin: user.isAdmin,
        },
        "privateKey",
      );

      console.log(token);
      return res.status(200).json({
        status: true,
        message: "Login Success",
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
    //* take the inputs from user and validate them
    const { userName, password: plainTextPassword, tenant_id } = req.body;

    const validateError = validateUserLogin(req.body);

    //* if validate error just send to user an error message
    console.log("error", validateError.error);
    let errors = [];

    if (validateError.error) {
      for (i = 0; i < validateError.error.details.length; i++) {
        errors[i] = validateError.error.details[i].message;
      }
      console.log(errors);
      return res.status(400).json({
        status: false,
        message: errors,
      });
    }
    console.log(tenant_id);
    if (!tenant_id) {
      return res.status(400).json({
        status: false,
        message: "Tenant is required",
      });
    }
    //* check in database by email
    let user = await Users.findOne({ userName, tenant_id }).lean();

    //* if not exist return an error messge
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: ["Invalid userName"] });
    }
    if (!["admin", "owner"].includes(user.role)) {
      return res
        .status(403)
        .json({ status: false, message: ["You are not allowed!"] });
    }

    try {
      //* compare between password and crypted password of user
      const checkPassword = await bcrypt.compare(
        req.body.password,
        user.password,
      );
      console.log(checkPassword);
      //* if password doesnt match return to user an error message
      if (!checkPassword) {
        return res
          .status(400)
          .json({ status: false, message: ["Invalid userName or password"] });
      }

      //* generate token that have his id and if admin or not
      //  const token= createAccessToken(  { id: user._id, isAdmin: user.isAdmin })
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        "privateKey",
      );

      console.log(token);
      return res.status(200).json({
        status: true,
        message: ["Login Success"],
        token: token,
        isAdmin: user.isAdmin,
      });
    } catch (error) {
      return res.status(500).json({ status: false, message: [error.message] });
    }
  },

  profile: async (req, res) => {
    const token = req.header("x-auth-token");
    try {
      const user = jwt.verify(token, "privateKey");
      console.log(user);
      const id = user.id;
      console.log(id);

      //* find the user info by his id and not show the password at response
      const profile = await Users.findById(id)

        .select("-password -__v ");
      console.log(req.params.id);
      console.log(profile);
      return res
        .status(200)
        .json({ status: true, message: "Profile", profile });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: error.message });
    }
  },

allUsers: async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [count, users] = await Promise.all([
      Users.countDocuments(),
      Users.find()
        .select("-password -__v")
        .skip(skip)
        .limit(limit)
        .lean().sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Get users",
      count,
      page,
      totalPages: Math.ceil(count / limit),
      users,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
},

getUser: async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // if search is empty → return paginated users normally
    let filter = {};

    if (search.trim()) {
      filter = {
        $or: [
          { userName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const [users, count] = await Promise.all([
      Users.find(filter)
        .select("-password -__v")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),

      Users.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: true,
      message: "Users fetched successfully",
      data: {
        users,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
},

  getUserCount: async (req, res) => {
    let search = req.params.search;
    try {
      const users = await Users.count();
      return res.status(200).json({ status: true, message: "Get user", users });
    } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
  },

  changePassword: async (req, res) => {
    //! take the password from user and validate it
    const { oldPassword: oldPassword, password: plainTextPassword } = req.body;

    //? take the token from header
    const token = req.header("x-auth-token");

    //! validate the password if not string
    if (!plainTextPassword || typeof plainTextPassword !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Old password Invalid" });
    }
    //! validate the password if less than 8 char
    if (plainTextPassword.length < 8) {
      return res.status(400).json({
        status: false,
        message: "Password too small. Should be atleast 8 characters",
      });
    }

    try {
      //* decode the token to get user data
      const user = jwt.verify(token, "privateKey");
      /*  console.log(user) */

      //* get user id
      const userId = user.id;
      console.log(userId);

      //* check in database by email
      let userCheck = await Users.findById(userId).lean();
      console.log(userCheck._id);

      console.log(userCheck.password);

      //* compare between password and crypted password of user
      const checkPassword = await bcrypt.compare(
        oldPassword,
        userCheck.password,
      );

      console.log(checkPassword);
      console.log(oldPassword);
      console.log(userCheck.password);

      //* if password doesnt match return to user an error message
      if (!checkPassword) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid password" });
      }

      //* incrypt new password
      const newPassword = await bcrypt.hash(plainTextPassword, 10);

      //* find the user by id and change the password
      await Users.updateOne(
        { _id: userId },
        {
          $set: { password: newPassword },
        },
      );
      console.log(userId);
      console.log(newPassword);

      return res
        .status(200)
        .json({ status: true, message: "Password changed" });
    } catch (error) {
      console.log(error);
      return res.json({ status: false, message: error.message });
    }
  },
  updatePreferences: async (req, res) => {
    const token = req.header("x-auth-token");
    const { language, currency } = req.body;

    try {
      const decoded = jwt.verify(token, "privateKey");
          check = Users.findById(decoded.id);
          if(!check){
             return res.status(400).json({
        status: false,
        message: "User not found",
      });
          }
      await Users.updateOne(
        { _id: decoded.id },
        {
          $set: {
            ...(language && { language }),
            ...(currency && { currency }),
          },
        },
      );

      return res.status(200).json({
        status: true,
        message: "Preferences updated",
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },
updateProfile: async (req, res) => {
  try {
    const token = req.header("x-auth-token");

    const decoded = jwt.verify(token, "privateKey");

    const user = await Users.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Build dynamic update object
    const updateFields = {};

    if (req.body.userName) {
      updateFields.userName = req.body.userName.trim();
    }

    if (req.body.noId) {
      updateFields.noId = req.body.noId;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        status: false,
        message: "No valid fields to update",
      });
    }

    const updatedUser = await Users.findByIdAndUpdate(
      decoded.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password -__v");

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
},

  changeRole: async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    const {id, role } = req.body;

    const decoded = jwt.verify(token,"privateKey");

    // Only owner can change roles (IMPORTANT SECURITY FIX)
    const requester = await Users.findById(decoded.id);

    if (!requester ||  requester.role !== "owner") {
      return res.status(403).json({
        status: false,
        message: "Forbidden: only owner can change roles",
      });
    }

    const user = await Users.findById(id);

    if (requester.tenant_id.toString() !== user.tenant_id.toString()) {
  return res.status(403).json({
    status: false,
    message: "Cross-tenant access denied",
  });
}

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const allowedRoles = ["owner", "admin", "staff", "customer"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        status: false,
        message: "Invalid role",
      });
    }

    const updatedUser = await Users.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true }
    ).select("-password -__v");

    return res.status(200).json({
      status: true,
      message: "Role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
},

  deleteUser: async (req, res) => {
    const token = req.header("x-auth-token");
    try {
      const user = jwt.verify(token, "privateKey");

      const check = await Users.findById(ObjectId(user.id));
      if (check) {
        let result;

        result = await Users.deleteOne({
          _id: user.id,
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

 deleteUserById: async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    const { id } = req.body;

    const decoded = jwt.verify(token, "privateKey");

    const requester = await Users.findById(decoded.id);
    if (!requester) {
      return res.status(401).json({
        status: false,
        message: "Invalid token user",
      });
    }

    // 🔐 Role check (ONLY admin or owner)
    if (!["admin", "owner"].includes(requester.role)) {
      return res.status(403).json({
        status: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    const user = await Users.findById(id);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
 if (requester.tenant_id.toString() !== user.tenant_id  .toString()) {
      return res.status(403).json({
        status: false,
        message: "Cross-tenant deletion is not allowed",
      });
    }
    // 🚨 Optional safety: prevent self delete
    if (requester._id.toString() === id) {
      return res.status(400).json({
        status: false,
        message: "You cannot delete your own account",
      });
    }

    const deletedUser = await Users.findByIdAndDelete(id,'-__v -password');

    return res.status(200).json({
      status: true,
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
},
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, "privateKey", {
    expiresIn: "1m",
  });
};

module.exports = userCtrl;
