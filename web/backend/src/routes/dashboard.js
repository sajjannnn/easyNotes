const express = require('express');
const router = express.Router();
const { getStats, getRecent, getRecentFiles } = require('../controllers/dashboard');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/stats', getStats);
router.get('/recent', getRecent);
router.get('/recent-files', getRecentFiles);

module.exports = router;
