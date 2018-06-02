
const express = require('express');
const controller = require('./pricing.controller');

const router = express.Router();

router.get('/', controller.index);

module.exports = router;
