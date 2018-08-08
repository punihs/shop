
const express = require('express');
const controller = require('./schedulePickup.controller');

const router = express.Router();

router.get('/', controller.index);
module.exports = router;
