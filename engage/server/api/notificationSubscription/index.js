
const express = require('express');
const controller = require('./notificationSubscription.controller');

const router = express.Router();

router.post('/', controller.create);
router.delete('/:playerId', controller.destroy);

module.exports = router;
