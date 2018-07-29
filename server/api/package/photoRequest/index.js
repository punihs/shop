
const express = require('express');
const controller = require('./photoRequest.controller');

const router = express.Router();

router.put('/:id/photoRequests', controller.create);

module.exports = router;
