
const express = require('express');
const controller = require('./comment.controller');
const autheticate = require('../../../components/oauth/authenticate');

const router = express.Router();

router.get('/', controller.index);
router.get('/:shipmentId/comments', autheticate(), controller.show);
router.post('/:shipmentId/comments', autheticate(), controller.create);

module.exports = router;

