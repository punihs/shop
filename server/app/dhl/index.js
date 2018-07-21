
const express = require('express');
const controller = require('./dhl.controller');

const router = express.Router();
router.get('/', controller.index);
router.get('/:slug', controller.show);

module.exports = router;
