const express = require('express');
const controller = require('./seo.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.get('/', controller.index);

module.exports = router;
