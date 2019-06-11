const express = require('express');

const controller = require('./health.controller');

const router = express.Router();

router.all('/', controller.health);

module.exports = router;
