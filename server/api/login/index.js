const express = require('express');
const controller = require('./login.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.post('/login', controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);

module.exports = router;
