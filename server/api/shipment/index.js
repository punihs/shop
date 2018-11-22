const express = require('express');
const controller = require('./shipment.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/queue', controller.shipQueue);
router.get('/count', controller.count);
router.get('/history', controller.history);
router.put('/:id/cancel', controller.cancelRequest);
router.put('/finalShip', controller.finalShipRequest); // - final payment submission:php
router.get('/:orderCode/confirmShipment', controller.show); // - submit payment:php
router.get('/redirectShipment', controller.redirectShipment); // - create shiprequest:php
router.post('/', controller.create);
router.get('/:id', controller.show);
router.post('/:id/unread', controller.unread);
router.put('/:id', controller.update);
router.put('/:id/paymentState', controller.paymentState);
router.put('/:id/meta', controller.metaUpdate);
router.delete('/:id', controller.destroy);
router.get('/:orderCode/invoice', controller.invoice);
router.put('/:id/state', controller.state);
router.get('/:id/response', controller.payResponse);
router.get('/:orderCode/request/shipRequestResponse', controller.shipRequestResponse);
router.put('/:id/tracking', controller.trackingUpdate);

module.exports = router;

