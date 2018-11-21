const express = require('express');
const controller = require('./charge.controller');

const router = express.Router();

router.get('/:id/charges', controller.show);
router.put('/:id/charges', controller.update);

module.exports = router;
