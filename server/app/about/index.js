
const express = require('express');
const controller = require('./about.controller');

const router = express.Router();

router.get('/', controller.index);

module.exports = router;
