
const express = require('express');
const controller = require('./coupon.controller');

const router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.put('/', controller.update);

module.exports = router;
