
const express = require('express');
const controller = require('./cron.controller');

const router = express.Router();

router.get('/shipment', controller.shipment);
router.get('/package', controller.package);


module.exports = router;

