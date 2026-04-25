// controllers/reviewController.js
const Review = require("../models/review_model");

const reviewCtrl = {
    createReview: async (req, res) => {
        const { tenant_id } = req.user;
        try {
            const review = await Review.create({ ...req.body, tenant_id, customer_id: req.user.id }); // assume user is customer
            return res.status(201).json({ status: true, data: review });
        } catch (err) {
            return res.status(500).json({ status: false, message: [err.message] });
        }
    },
    getReviews: async (req, res) => {
        const { tenant_id } = req.user;
        const { service_id, staff_id } = req.query;
        const filter = { tenant_id, isDeleted: false };
        if (service_id) filter.service_id = service_id;
        if (staff_id) filter.staff_id = staff_id;
        const reviews = await Review.find(filter).populate("customer_id", "name").lean();
        return res.status(200).json({ status: true, data: reviews });
    },
    replyToReview: async (req, res) => {
        const { tenant_id, role } = req.user;
        if (!["owner", "admin", "staff"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
        // add reply
    },
    getReviewById: async (req, res) => {
        const { tenant_id } = req.user;
        const { id } = req.body;
        try {
            const review = await Review.findOne({ _id: id, tenant_id, isDeleted: false })
                .populate("customer_id", "name")
                .lean();
            if (!review) return res.status(404).json({ status: false, message: ["Not found"] });
            return res.status(200).json({ status: true, data: review });
        } catch (err) {
            return res.status(500).json({ status: false, message: [err.message] });
        }
    },

    replyToReview: async (req, res) => {
        const { tenant_id, role } = req.user;
        if (!["owner", "admin", "staff"].includes(role)) return res.status(403).json({ status: false, message: ["Forbidden"] });
        const { id, text } = req.body;
        if (!text) return res.status(400).json({ status: false, message: ["Reply text required"] });
        try {
            const review = await Review.findOneAndUpdate(
                { _id: id, tenant_id },
                { $set: { "reply.text": text, "reply.repliedAt": new Date(), "reply.repliedBy": req.user.id } },
                { new: true }
            );
            if (!review) return res.status(404).json({ status: false, message: ["Not found"] });
            return res.status(200).json({ status: true, data: review });
        } catch (err) {
            return res.status(500).json({ status: false, message: [err.message] });
        }
    },

    updateReview: async (req, res) => {
        const { tenant_id } = req.user;
        const { id, rating, comment } = req.body;
        try {
            const review = await Review.findOne({ _id: id, tenant_id });
            if (!review) return res.status(404).json({ status: false, message: ["Not found"] });
            if (review.customer_id.toString() !== req.user.id) return res.status(403).json({ status: false, message: ["Not your review"] });
            if (rating) review.rating = rating;
            if (comment) review.comment = comment;
            await review.save();
            return res.status(200).json({ status: true, data: review });
        } catch (err) {
            return res.status(500).json({ status: false, message: [err.message] });
        }
    },

    deleteReview: async (req, res) => {
        const { tenant_id } = req.user;
        const { id } = req.body;
        try {
            const review = await Review.findOne({ _id: id, tenant_id });
            if (!review) return res.status(404).json({ status: false, message: ["Not found"] });
            if (review.customer_id.toString() !== req.user.id && !["owner", "admin"].includes(req.user.role)) {
                return res.status(403).json({ status: false, message: ["Forbidden"] });
            }
            review.isDeleted = true;
            await review.save();
            return res.status(200).json({ status: true, message: "Review deleted" });
        } catch (err) {
            return res.status(500).json({ status: false, message: [err.message] });
        }
    }
};
module.exports = reviewCtrl;