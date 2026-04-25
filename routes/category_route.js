const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const categoryCtrl = require("../controllers/categoryController");

router.post("/", auth, categoryCtrl.createCategory);
router.get("/", auth, categoryCtrl.getAllCategories);
router.get("/id", auth, categoryCtrl.getCategoryById);
router.patch("/update", auth, categoryCtrl.updateCategory);
router.delete("/delete", auth, categoryCtrl.deleteCategory);

module.exports = router;