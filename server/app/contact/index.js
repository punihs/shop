
const express = require('express');
const controller = require('./contact.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/confirmation', controller.confirmation);

module.exports = router;
