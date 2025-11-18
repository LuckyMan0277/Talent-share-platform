const express = require('express');
const router = express.Router();
const {
  getMyTalents,
  getMyBookings,
  getReceivedBookings,
  updateProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(protect);

router.get('/my-talents', getMyTalents);
router.get('/my-bookings', getMyBookings);
router.get('/received-bookings', getReceivedBookings);
router.put('/profile', upload.single('profileImage'), updateProfile);

module.exports = router;
