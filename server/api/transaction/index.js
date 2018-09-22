
const express = require('express');
const controller = require('../transaction/transaction.controller');
const authenticate = require('../../components/oauth/authenticate');

const router = express.Router();

router.get('/', authenticate(), controller.index);
router.post('/', authenticate(), controller.create);
router.put('/:id', controller.update);
router.delete('/:id', authenticate(), controller.destroy);
router.all('/:id/complete', controller.complete);

module.exports = router;

