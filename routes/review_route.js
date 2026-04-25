const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const reviewCtrl = require("../controllers/reviewController");

router.post("/", auth, reviewCtrl.createReview);
router.get("/", auth, reviewCtrl.getReviews);
router.get("/id", auth, reviewCtrl.getReviewById);
router.patch("/reply", auth, reviewCtrl.replyToReview);
router.patch("/update", auth, reviewCtrl.updateReview);
router.delete("/delete", auth, reviewCtrl.deleteReview);

module.exports = router;