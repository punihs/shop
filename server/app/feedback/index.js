
const express = require('express');
const controller = require('./feedback.controller');

const router = express.Router();

router.get('/', controller.index);

module.exports = router;
