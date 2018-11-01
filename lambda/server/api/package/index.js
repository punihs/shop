
const express = require('express');
const controller = require('./package.controller');

const router = express.Router();

router.post('/notifications', controller.notifications);

module.exports = router;

