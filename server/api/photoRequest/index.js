
const express = require('express');
const controller = require('./photoRequest.controller');

const router = express.Router();

router.put('/', controller.photoRequest);

module.exports = router;
