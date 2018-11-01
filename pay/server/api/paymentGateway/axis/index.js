
const express = require('express');
const controller = require('./axis.controller');

const router = express.Router();

router.get('/', controller.create);
// router.get('/payment', controller.paymentSubmit);
// router.get('/directPaymentInitiate', controller.directPaymentInitiate);

module.exports = router;

