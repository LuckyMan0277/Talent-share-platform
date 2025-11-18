const express = require('express');
const router = express.Router();
const {
  getTalents,
  getTalent,
  createTalent,
  updateTalent,
  deleteTalent,
  getSchedules,
  addSchedule
} = require('../controllers/talentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getTalents);
router.get('/:id', getTalent);
router.get('/:id/schedules', getSchedules);

// Protected routes (require authentication)
router.post('/', protect, upload.single('talentImage'), createTalent);
router.put('/:id', protect, upload.single('talentImage'), updateTalent);
router.delete('/:id', protect, deleteTalent);
router.post('/:id/schedules', protect, addSchedule);

module.exports = router;
