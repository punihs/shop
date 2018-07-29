
const express = require('express');
const controller = require('./shopShip.controller');

const router = express.Router();

router.get('/', controller.index);

module.exports = router;
