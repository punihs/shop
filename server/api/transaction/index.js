const express = require('express');
const controller = require('./transaction.controller');

const router = express.Router();
//
// router.get('/', controller.walletShow);
// router.get('/loyalty', controller.loyaltyShow);
// router.put('/', controller.walletUpdate);
// router.put('/loyalty', controller.loyaltyUpdate);
router.post('/', controller.create);

module.exports = router;
