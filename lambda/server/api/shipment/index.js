const express = require('express');
const controller = require('./shipment.controller');

const router = express.Router();

router.post('/notifications', controller.notification);

module.exports = router;
