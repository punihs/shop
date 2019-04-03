const express = require('express');
const controller = require('./package.controller');
const autheticate = require('../../components/oauth/authenticate');

const router = express.Router();

router.get('/', autheticate(), controller.index);
router.get('/bulkIndex', autheticate(), controller.bulkIndex);
router.get('/:id', autheticate(), controller.show);
router.post('/', autheticate(), controller.create);
router.put('/:id/state', autheticate(), controller.state);
router.put('/:id', autheticate(), controller.update);
router.delete('/:id', autheticate(), controller.destroy);
router.put('/:id/invoice', autheticate(), controller.invoice);
router.get('/items/damaged', autheticate(), controller.damaged);

module.exports = router;

