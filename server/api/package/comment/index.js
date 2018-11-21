const express = require('express');
const controller = require('./comment.controller');
const autheticate = require('../../../components/oauth/authenticate');

const router = express.Router();

router.get('/:packageId/comments', autheticate(), controller.index);
router.post('/:packageId/comments', autheticate(), controller.create);

module.exports = router;

