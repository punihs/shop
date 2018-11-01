const express = require('express');
const controller = require('./emailTemplate.controller');

const router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);

module.exports = router;

