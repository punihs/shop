
const express = require('express');
const controller = require('./storeCategory.controller');

const router = express.Router();
router.get('/', controller.index);
router.get('/:slug', controller.show);

module.exports = router;
