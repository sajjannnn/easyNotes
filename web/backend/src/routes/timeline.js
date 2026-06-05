const express = require('express');
const router = express.Router();
const { getByFile } = require('../controllers/timeline');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/file/:fileId', getByFile);

module.exports = router;
