
const express = require('express');
const controller = require('./photoRequest.controller');

const router = express.Router();

router.put('/:id/standardPhotoRequest', controller.standardPhotoRequest);
router.put('/:id/advancephotoRequest', controller.advancephotoRequest);

module.exports = router;
