
const express = require('express');
const controller = require('./paymentGateway.controller');

const router = express.Router();

router.get('/:slug', controller.show);

module.exports = router;
