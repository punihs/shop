
const express = require('express');
const controller = require('./customer.controller');

const router = express.Router();

router.get('/me', controller.me);
router.post('/', controller.create);

module.exports = router;
