const Service = require("../models/service_model");

const serviceCtrl = {
  // CREATE a new service
  createService: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;

      // 🔐 RBAC
      if (!["owner", "admin"].includes(role)) {
        return res.status(403).json({
          status: false,
          message: ["Forbidden"],
        });
      }

      const { name, duration, price, imageUrl, cloudinary_id } = req.body;

      if (!name || !duration || !price) {
        return res.status(400).json({
          status: false,
          message: ["Missing required fields"],
        });
      }

      if (duration <= 0 || price < 0) {
        return res.status(400).json({
          status: false,
          message: ["Invalid duration or price"],
        });
      }

      const existing = await Service.findOne({ name, tenant_id });

      if (existing) {
        return res.status(400).json({
          status: false,
          message: ["Service already exists"],
        });
      }

      const service = await Service.create({
        name,
        duration,
        price,
        imageUrl,
        cloudinary_id,
        tenant_id,
      });

      return res.status(201).json({
        status: true,
        data: service,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: [error.message],
      });
    }
  },

  // GET all services for the tenant
  getAllServices: async (req, res) => {
    try {
      const { tenant_id } = req.user;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [services, count] = await Promise.all([
        Service.find({ tenant_id })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Service.countDocuments({ tenant_id }),
      ]);

      return res.status(200).json({
        status: true,
        data: services,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: [error.message],
      });
    }
  },

  // GET single service by ID
  getServiceById: async (req, res) => {
    try {
      const { tenant_id } = req.user;
      const { id } = req.body;

      const service = await Service.findOne({
        _id: id,
        tenant_id,
      }).populate('tenant_id','-__v').lean();

      if (!service) {
        return res.status(404).json({
          status: false,
          message: ["Service not found"],
        });
      }

      return res.status(200).json({
        status: true,
        data: service,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: [error.message],
      });
    }
  },

  // UPDATE a service
  updateService: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;
      const { id } = req.body;

      if (!["owner", "admin"].includes(role)) {
        return res.status(403).json({
          status: false,
          message: ["Forbidden"],
        });
      }

      const service = await Service.findOne({ _id: id, tenant_id });

      if (!service) {
        return res.status(404).json({
          status: false,
          message: ["Service not found"],
        });
      }

      // Prevent duplicate name
      if (req.body.name && req.body.name !== service.name) {
        const exists = await Service.findOne({
          name: req.body.name,
          tenant_id,
        });

        if (exists) {
          return res.status(400).json({
            status: false,
            message: ["Service name already exists"],
          });
        }
      }

      Object.assign(service, req.body);

      await service.save();

      return res.status(200).json({
        status: true,
        data: service,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: [error.message],
      });
    }
  },
  // DELETE a service
  deleteService: async (req, res) => {
    try {
      const { tenant_id, role } = req.user;
      const { id } = req.body;

      if (!["owner", "admin"].includes(role)) {
        return res.status(403).json({
          status: false,
          message: ["Forbidden"],
        });
      }

      const service = await Service.findOneAndDelete({
        _id: id,
        tenant_id,
      });

      if (!service) {
        return res.status(404).json({
          status: false,
          message: ["Service not found"],
        });
      }

      return res.status(200).json({
        status: true,
        message: ["Service deleted"],
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: [error.message],
      });
    }
  },
};
module.exports = serviceCtrl;
