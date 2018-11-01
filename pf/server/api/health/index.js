const express = require('express');
const controller = require('./health.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.all('/', controller.health);

module.exports = router;
