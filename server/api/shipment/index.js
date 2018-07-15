
const express = require('express');
const controller = require('./shipment.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/queue', controller.shipQueue);
router.get('/history', controller.history);
router.put('/:id/cancel', controller.cancelRequest);
router.put('/finalShip', controller.finalShipRequest); // - final payment submission:php
router.put('/payRetrySubmit', controller.payRetrySubmit);
router.put('/retryPayment', controller.retryPayment);
router.get('/confirmShipment', controller.confirmShipment); // - submit payment:php
router.get('/redirectShipment', controller.redirectShipment); // - create shiprequest:php
router.post('/', controller.create);
router.get('/:id', controller.show);
router.post('/:id/unread', controller.unread);
router.put('/:id', controller.update);
router.put('/:id/meta', controller.metaUpdate);
router.delete('/:id', controller.destroy);
router.get('/:id/invoice', controller.invoice);
router.put('/:id/state', controller.state);

module.exports = router;

