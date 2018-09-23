
const express = require('express');
const controller = require('./user.controller.lamba');

const router = express.Router();

router.post('/notifications', controller.notifications);

module.exports = router;

