const express = require('express');
const controller = require('./passwordReset.controller');

const router = express.Router();

router.post('/submitForgot', controller.submitForgot);
router.put('/resetPassword', controller.update);

module.exports = router;
