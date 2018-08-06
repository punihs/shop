
const express = require('express');
const controller = require('./review.controller');

const router = express.Router();

router.get('/', controller.index);

module.exports = router;
