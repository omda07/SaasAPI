const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const invoiceCtrl = require("../controllers/invoiceController");

router.post("/", auth, invoiceCtrl.createInvoice);
router.get("/", auth, invoiceCtrl.getInvoices);
router.get("/id", auth, invoiceCtrl.getInvoiceById);
router.patch("/update", auth, invoiceCtrl.updateInvoice);
router.delete("/delete", auth, invoiceCtrl.deleteInvoice);

module.exports = router;