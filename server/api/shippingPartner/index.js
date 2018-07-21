
const express = require('express');
const controller = require('./shippingPartner.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/partners', controller.dhl);
router.get('/:slug', controller.show);


module.exports = router;

