const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const customerCtrl = require("../controllers/customerController");

router.post("/", auth, customerCtrl.createCustomer);
router.get("/", auth, customerCtrl.getAllCustomers);
router.get("/id", auth, customerCtrl.getCustomerById);
router.patch("/update", auth, customerCtrl.updateCustomer);
router.delete("/delete", auth, customerCtrl.deleteCustomer);

module.exports = router;