const express = require('express');
const router = express.Router();
const multer = require('multer');
const { create, getByFile, remove } = require('../controllers/screenshots');
const auth = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'), false);
    }
  },
});

router.use(auth);

router.post('/', upload.single('image'), create);
router.get('/', getByFile);
router.delete('/:id', remove);

module.exports = router;
