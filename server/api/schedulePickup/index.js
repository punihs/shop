
const express = require('express');
const controller = require('./schedulePickup.controller');
const autheticate = require('../../components/oauth/authenticate');

const router = express.Router();


router.get('/', controller.index);
router.post('/', autheticate(), controller.create);

module.exports = router;

