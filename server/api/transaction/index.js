
const express = require('express');
const controller = require('../transaction/transaction.controller');
const authenticate = require('../../components/oauth/authenticate');

const router = express.Router();

router.get('/', authenticate(), controller.index);
router.post('/', authenticate(), controller.create);

module.exports = router;

