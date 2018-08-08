
const express = require('express');
const controller = require('./redemption.controller');

const router = express.Router();
router.put('/apply', controller.update);

module.exports = router;

