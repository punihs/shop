
const express = require('express');
const controller = require('./shipment.controller');

const router = express.Router();

router.get('/:slug/shipments/:id', controller.show);
router.get('/:slug/shipments', controller.show);

module.exports = router;

