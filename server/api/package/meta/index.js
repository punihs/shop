
const express = require('express');
const controller = require('./meta.controller');

const router = express.Router();

router.get('/:id/meta', controller.show);
router.put('/:id/meta', controller.update);

module.exports = router;
