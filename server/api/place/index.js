
const express = require('express');
const controller = require('./place.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);

module.exports = router;
