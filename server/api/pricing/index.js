const express = require('express');
const controller = require('./pricing.controller');

const router = express.Router(); // eslint-disable-line new-cap
router.get('/', controller.index);
router.all('/ai', controller.ai);
router.all('/expressive', controller.expressive);
router.get('/customerPricing', controller.customerPricing);
router.get('/shipCalculate', controller.shipCalculate);

module.exports = router;
