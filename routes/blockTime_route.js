const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const blockTimeCtrl = require("../controllers/blockTimeController");

router.post("/", auth, blockTimeCtrl.createBlock);
router.get("/", auth, blockTimeCtrl.getBlocks);
router.delete("/delete", auth, blockTimeCtrl.deleteBlock);

module.exports = router;