
const express = require('express');
const controller = require('./partner.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/:name', controller.show);

module.exports = router;
