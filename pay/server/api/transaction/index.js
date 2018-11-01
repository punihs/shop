
const express = require('express');
const controller = require('../transaction/transaction.controller');
const payController = require('../transaction/pay.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/create', payController.create);
router.get('/:id', payController.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.all('/:id/complete', controller.complete);

module.exports = router;

