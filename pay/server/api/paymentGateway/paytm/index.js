
const express = require('express');
const controller = require('./paytm.controller');

const router = express.Router();

router.get('/', controller.create);
router.get('/response', controller.responsePayment);

module.exports = router;

