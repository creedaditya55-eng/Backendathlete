const express = require('express');
const router = express.Router();
const {
  getAthletes,
  getAthleteById,
  getMyProfile,
  updateProfile,
  addVideo,
  removeVideo,
  getStats,
} = require('../controllers/athleteController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(getAthletes);
router.route('/stats/public').get(getStats);
router.route('/profile/me').get(protect, getMyProfile);
router.route('/profile').put(protect, upload.single('profilePhoto'), updateProfile);
router.route('/video').post(protect, addVideo);
router.route('/video/:videoId').delete(protect, removeVideo);
router.route('/:id').get(getAthleteById);

module.exports = router;
