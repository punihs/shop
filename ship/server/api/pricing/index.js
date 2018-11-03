const express = require('express');
const controller = require('./pricing.controller');

const router = express.Router();

router.get('/', controller.index);
router.all('/calcShipping', controller.calcShipping);
router.all('/expressive', controller.expressive);
router.get('/customerPricing', controller.customerPricing);
router.get('/shipCalculate', controller.shipCalculate);

module.exports = router;
