const express = require('express');
const router = express.Router();
const { registerAthlete, authAthlete, resetPassword } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', upload.single('profilePhoto'), registerAthlete);
router.post('/login', authAthlete);
router.post('/reset-password', resetPassword);

module.exports = router;
