
const express = require('express');
const controller = require('./item.controller');
const autheticate = require('../../../components/oauth/authenticate');

const router = express.Router();

router.get('/:packageId/items', autheticate(), controller.index);
router.post('/:packageId/items', autheticate(), controller.create);

module.exports = router;

