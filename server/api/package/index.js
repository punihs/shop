
const express = require('express');
const controller = require('./package.controller');

const router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.post('/:id/unread', controller.unread);
router.put('/:id', controller.metaUpdate);
router.delete('/:id', controller.destroy);

module.exports = router;

