
const express = require('express');
const controller = require('./shippingPreference.controller');

const router = express.Router();

router.get('/:id/shippingPreference', controller.show);
router.put('/:id/shippingPreference', controller.update);

module.exports = router;

