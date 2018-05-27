
const express = require('express');
const controller = require('./packageItem.controller');

const router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.get('/:id', controller.show);
router.put('/:id/meta', controller.metaUpdate);
router.delete('/:id', controller.destroy);
router.put('/:id/image', controller.update);

module.exports = router;
