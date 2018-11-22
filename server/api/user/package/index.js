const express = require('express');
const controller = require('./../../package/package.controller');

const router = express.Router();

router.get('/:customerId/packages', controller.index);

module.exports = router;

