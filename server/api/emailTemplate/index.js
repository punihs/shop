const express = require('express');
const controller = require('./emailTemplate.controller');
const oAuthenticate = require('./../../components/oauth/authenticate');

const router = express.Router();

router.get('/', oAuthenticate(), controller.index);

module.exports = router;

