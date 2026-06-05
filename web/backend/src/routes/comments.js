const express = require('express');
const router = express.Router();
const { create, getByFile, remove } = require('../controllers/comments');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCommentValidation } = require('../validation/schemas');

router.use(auth);

router.post('/', validate(createCommentValidation), create);
router.get('/', getByFile);
router.delete('/:id', remove);

module.exports = router;
