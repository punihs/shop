
const express = require('express');
const controller = require('./shippingPreference.controller');

const router = express.Router();

router.get('/:id', controller.show);
router.put('/:id', controller.update);

module.exports = router;

