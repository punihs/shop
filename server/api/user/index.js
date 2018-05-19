
const express = require('express');
const controller = require('./user.controller');

const router = express.Router();

router.get('/me', controller.me);
router.post('/', controller.create);

module.exports = router;
