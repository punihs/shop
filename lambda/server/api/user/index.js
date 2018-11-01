
const express = require('express');
const controller = require('./user.controller');

const router = express.Router();

router.post('/notifications', controller.notifications);

module.exports = router;

