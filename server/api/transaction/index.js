
const express = require('express');
const controller = require('../transaction/transaction.controller');

const router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);

module.exports = router;

