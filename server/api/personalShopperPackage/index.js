
const express = require('express');
const controller = require('../personalShopperPackage/personalShopperPackage.controller');

const router = express.Router();
router.get('/', controller.index);
router.get('/:id/orderForm', controller.orderForm);
router.get('/:id/editOrder', controller.editOrder);
router.get('/:id/shopperCart', controller.shopperCart);
router.post('/', controller.create);
router.post('/submitOptions', controller.submitOptions);
router.post('/submitPayment', controller.submitPayment);
router.get('/shopperResponse', controller.shopperResponse);
router.get('/:id/orderPayChange', controller.orderPayChange);
router.get('/shopperOptions', controller.shopperOptions);
router.get('/shopperSummary', controller.shopperSummary);
router.get('/shopperPayment', controller.shopperPayment);
router.get('/shopperHistory', controller.shopperHistory);
router.get('/:id/cancelShopper', controller.cancelShopper);
router.get('/orderInvoice', controller.orderInvoice);
router.put('/', controller.updateOrder);
router.delete('/:id/order', controller.destroyOrder);
router.delete('/:id/request', controller.destroyReq);

router.get('/:id', controller.show);
router.put('/:id/unread', controller.unread);
router.put('/:id/updateShopOrder', controller.updateShopOrder);
router.put('/:id/updateOrderItem', controller.updateOrderItem);


module.exports = router;

