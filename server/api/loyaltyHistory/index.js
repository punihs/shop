
const express = require('express');
const controller = require('./loyaltyHistory.controller');

const router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);


module.exports = router;
