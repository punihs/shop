const express = require('express');
const controller = require('./axis.controller');

const router = express.Router();

router.get('/start', controller.init);
router.all('/success', controller.success);

module.exports = router;
