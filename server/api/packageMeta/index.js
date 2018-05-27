
const express = require('express');
const controller = require('./packageMeta.controller');

const router = express.Router();

router.get('/:id', controller.show);
router.put('/:id', controller.metaUpdate);

module.exports = router;
