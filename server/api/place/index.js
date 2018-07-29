
const express = require('express');
const controller = require('./place.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/places/?type=state', controller.show); // - slug = countries, state, district

module.exports = router;
