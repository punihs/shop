
const express = require('express');
const controller = require('./../../order/order.controller');

const router = express.Router();

router.get('/:customerId/orders', controller.index);

module.exports = router;
