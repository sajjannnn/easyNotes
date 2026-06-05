const express = require('express');
const router = express.Router();
const { search } = require('../controllers/search');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', search);

module.exports = router;
