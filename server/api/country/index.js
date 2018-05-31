
const express = require('express');
const controller = require('../country/country.controller');

const router = express.Router();

router.get('/', controller.index);

module.exports = router;

