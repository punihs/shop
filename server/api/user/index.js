
const express = require('express');
const controller = require('./user.controller');

const router = express.Router();

router.get('/me', controller.me);
router.get('/states', controller.states);
router.post('/', controller.create);

module.exports = router;
