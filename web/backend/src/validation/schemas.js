const { body } = require('express-validator');

const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name is required.'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

const createFolderValidation = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Folder name is required.'),
];

const renameFolderValidation = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Folder name is required.'),
];

const createFileValidation = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('File name is required.'),
];

const renameFileValidation = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('File name is required.'),
];

const createCommentValidation = [
  body('text')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Comment text is required.'),
  body('videoId')
    .notEmpty()
    .withMessage('Video ID is required.'),
  body('fileId')
    .notEmpty()
    .withMessage('File ID is required.'),
];

const createSummaryValidation = [
  body('videoId')
    .notEmpty()
    .withMessage('Video ID is required.'),
  body('fileId')
    .notEmpty()
    .withMessage('File ID is required.'),
];

module.exports = {
  registerValidation,
  loginValidation,
  createFolderValidation,
  renameFolderValidation,
  createFileValidation,
  renameFileValidation,
  createCommentValidation,
  createSummaryValidation,
};
