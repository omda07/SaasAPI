const express = require("express");

const router = express.Router();
const multer  = require('multer');

const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const uploadImage = require("../middleware/uploadImage");


const khatmaCtrl = require("../controllers/khatmaController");

//* define storage for the images

const storage = multer.diskStorage({
    //destination for files
    destination: function (request, file, callback) {
      callback(null, './uploads');
    },
  
    //add back the extension
    filename: function (request, file, callback) {
      callback(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
    },
  });

//* upload parameters for multer
const upload = multer({
    storage: storage,
    limits: {
      fieldSize: 1024 * 1024 * 3,
    },
  });
  
// ____________________________GETTING_________________________________

router.get("/allRoom", [auth,khatmaCtrl.getRooms]);
router.get("/roomById", [auth, khatmaCtrl.getRoomById]);

// get CheckIn middleware
router.get("/allKhatma", [auth,khatmaCtrl.getKhatma]);
// router.get("/userKhatma", [auth, khatmaCtrl.getUserKhatma]);
router.get("/khatmaById", [auth, khatmaCtrl.getKhatmaById]);
// get CheckOut middleware
// router.get('/allCheckOut',timeCtrl.getCheckOut)

// // get CheckIn middleware
// router.get('/allCheckInRequests',[admin,timeCtrl.getCheckInRequest])
// // get CheckOut middleware
// router.get('/allCheckOutRequests',[admin,timeCtrl.getCheckOutRequest])

// // get time middleware
// router.get('/getCheckIn/:date',timeCtrl.getByDateCheckIn)
// // get time middleware
// router.get('/getCheckOut/:date',timeCtrl.getByDateCheckOut)

//* ________________________________CREATE_________________________________________

// Creating one Course
router.post("/newKhatma",  [auth,khatmaCtrl.createKhatma]);

//* _________________________________CREATE ROOM____________________________________________
router.post("/newRoom",  [auth,khatmaCtrl.createRoom]);

// router.post('/newCheckOut', [auth,timeCtrl.createCheckOut])

//? ____________________________________UPDATE____________________________________________

router.patch('/updateRoom', [auth,khatmaCtrl.updateRoom])
router.patch('/updateJuz', [auth,khatmaCtrl.updateJuz])

router.patch('/updateRemoveKhatmaAssignee', [auth,khatmaCtrl.updateRemoveKhatmaAssignee])
router.put('/uploadRoom', [upload.single('imageUrl'), auth, khatmaCtrl.uploadRoom])

// router.patch('/acceptCheckOut', [auth,timeCtrl.updateAcceptanceCheckOut])

//! _____________________________________________DELETE_____________________________________

router.delete('/deleteKhatma', [auth,khatmaCtrl.deleteKhatma])
router.delete('/deleteRoom', [admin,khatmaCtrl.deleteRoom])
//! Deleting course

module.exports = router;
