const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerValidation, loginValidation } = require('../validation/schemas');

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.get('/me', auth, getMe);

module.exports = router;
