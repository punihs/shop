
const express = require('express');
const controller = require('./package.controller');
const autheticate = require('../../components/oauth/authenticate');

const router = express.Router();

router.get('/', controller.index);
router.get('/', autheticate(), controller.index);
router.get('/:id', autheticate(), controller.show);
router.post('/', autheticate(), controller.create);
router.put('/:id/state', controller.state);
router.put('/:id/facets', controller.facets);
router.post('/:id/unread', controller.unread);
router.put('/:id', controller.metaUpdate);
router.delete('/:id', controller.destroy);

module.exports = router;

