
const express = require('express');
const controller = require('./package.controller');
const autheticate = require('../../components/oauth/authenticate');

const router = express.Router();

router.get('/', controller.indexPublic);
router.get('/', autheticate(), controller.index);
router.get('/', autheticate(), controller.index);
router.get('/:id', autheticate(), controller.show);
router.post('/', autheticate(), controller.create);
router.put('/:id/state', autheticate(), controller.state);
router.put('/:id/facets', autheticate(), controller.facets);
router.post('/:id/unread', autheticate(), controller.unread);
router.put('/:id', autheticate(), controller.update);
router.delete('/:id', autheticate(), controller.destroy);

module.exports = router;

