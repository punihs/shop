const express = require('express');
const controller = require('./shippingRate.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.get('/', controller.index);
router.all('/ai', controller.ai);

module.exports = router;