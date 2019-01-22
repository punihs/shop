
const express = require('express');
const controller = require('./personalShopperPackage.controller');
const controllerService = require('./personalShopperPackage.service');

const router = express.Router();
router.post('/personalShopperPackage', controller.create);
router.put('/personalShopperPackage/:id', controller.editItem);
router.delete('/personalShopperPackage/:id/order', controller.destroyOrder);
router.delete('/personalShopperPackage/:id/item/:itemId', controller.destroyItem);
router.post('/personalShopperPackage/submitOptions', controller.submitOptions);
router.put('/personalShopperPackage/:id/cancelOrder', controller.cancelOrder);
router.put('/personalShopperPackage/:id/proceed', controller.proceed);
router.put('/personalShopperPackage/:id/itemsProceed', controller.itemsProceed);
router.put('/personalShopperPackage/:id/updateItem', controller.updateItem);
router.get('/personalShopperPackage/history', controller.history);
router.get('/personalShopperPackage/paymentSuccess', controller.paymentSuccess);
router.get('/:id/response/payment', controllerService.payResponse);

module.exports = router;

