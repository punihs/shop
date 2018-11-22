const express = require('express');
const controller = require('./follower.controller');
const autheticate = require('../../../components/oauth/authenticate');

const router = express.Router();

router.get('/:packageId/followers', autheticate(), controller.index);

module.exports = router;
