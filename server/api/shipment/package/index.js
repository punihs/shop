
const express = require('express');
const controller = require('./package.controller');

const router = express.Router();

router.get('/:shipment_id/packages', controller.index);

module.exports = router;

