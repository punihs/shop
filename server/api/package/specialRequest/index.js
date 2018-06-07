
const express = require('express');
const controller = require('./specialRequest.controller');

const router = express.Router();
router.put('/:id/return', controller.return);
router.put('/:id/split', controller.split);
router.put('/:id/abandon', controller.abandon);

module.exports = router;
