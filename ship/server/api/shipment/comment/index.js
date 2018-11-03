
const express = require('express');
const controller = require('./comment.controller');
const autheticate = require('../../../components/oauth/authenticate');

const router = express.Router();

router.get('/:shipmentId/comments', autheticate(), controller.index);
router.post('/:shipmentId/comments', autheticate(), controller.create);

module.exports = router;

