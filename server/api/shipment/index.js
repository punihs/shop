
const express = require('express');
const controller = require('./shipment.controller');

const router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.get('/orders/:id', controller.shipOrder);
router.post('/:id/unread', controller.unread);
router.put('/:id', controller.update);
router.put('/:id/meta', controller.metaUpdate);
router.delete('/:id', controller.destroy);

module.exports = router;

