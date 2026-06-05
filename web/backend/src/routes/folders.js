const express = require('express');
const router = express.Router();
const { create, rename, remove, move, getAll } = require('../controllers/folders');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createFolderValidation, renameFolderValidation } = require('../validation/schemas');

router.use(auth);

router.post('/', validate(createFolderValidation), create);
router.get('/', getAll);
router.patch('/:id', validate(renameFolderValidation), rename);
router.delete('/:id', remove);
router.patch('/:id/move', move);

module.exports = router;
