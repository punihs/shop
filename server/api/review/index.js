
const express = require('express');
const controller = require('../review/review.controller');

const router = express.Router();

router.get('/', controller.index);

module.exports = router;

