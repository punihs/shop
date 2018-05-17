
const express = require('express');
const controller = require('./shipRequest.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);

module.exports = router;
