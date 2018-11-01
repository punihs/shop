const express = require('express');
const controller = require('./emailPreference.controller');

const router = express.Router();

router.get('/:user_id', controller.show);
router.post('/', controller.create);

module.exports = router;
