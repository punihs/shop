
const express = require('express');
const controller = require('./shippingPartner.controller');

const router = express.Router();

router.get('/:slug', controller.show);

module.exports = router;
