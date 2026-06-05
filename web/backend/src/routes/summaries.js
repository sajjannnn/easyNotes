const express = require('express');
const router = express.Router();
const { getByFile, getByVideo, create } = require('../controllers/summaries');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createSummaryValidation } = require('../validation/schemas');

router.use(auth);

router.post('/', validate(createSummaryValidation), create);
router.get('/', getByFile);
router.get('/video/:videoId', getByVideo);

module.exports = router;
