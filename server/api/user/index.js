
const express = require('express');
const controller = require('./user.controller');

const router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.get('/:id', controller.show);
router.put('/:id/unread', controller.unread);
router.delete('/:id', controller.destroy);

module.exports = router;
