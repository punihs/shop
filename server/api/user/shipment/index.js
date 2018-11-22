const express = require('express');
const controller = require('./../../shipment/shipment.controller');

const router = express.Router();

router.get('/:customerId/shipments', controller.index);

module.exports = router;

