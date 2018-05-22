
const express = require('express');
const controller = require('./order.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/:id/download', controller.download);
router.post('/', controller.create);

module.exports = router;
