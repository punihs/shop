
const express = require('express');
const controller = require('./paypal.controller');

const router = express.Router();

router.post('/paypal', controller.create);

module.exports = router;

