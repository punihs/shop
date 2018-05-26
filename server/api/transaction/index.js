
const express = require('express');
const controller = require('../transaction/transaction.controller');

const router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.delete('/:id', controller.destroy);

module.exports = router;

