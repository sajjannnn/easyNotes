const express = require('express');
const router = express.Router();
const { create, rename, remove, move, getAll, getById } = require('../controllers/files');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createFileValidation, renameFileValidation } = require('../validation/schemas');

router.use(auth);

router.post('/', validate(createFileValidation), create);
router.get('/', getAll);
router.get('/:id', getById);
router.patch('/:id', validate(renameFileValidation), rename);
router.delete('/:id', remove);
router.patch('/:id/move', move);

module.exports = router;
