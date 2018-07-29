
const express = require('express');
const controller = require('./shippingPartner.controller');

const router = express.Router();
router.get('/', controller.index);
router.get('/partner/:slug', controller.list);
router.get('/partner/:slug/detail/:id', controller.detail);
router.get('/:slug', controller.show);


module.exports = router;

