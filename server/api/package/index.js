
const express = require('express');
const controller = require('./package.controller');
const autheticate = require('../../components/oauth/authenticate');

const router = express.Router();

router.get('/', controller.indexPublic);
router.get('/', autheticate(), controller.index);
// router.get('/:id/count', autheticate(), controller.count);
router.get('/:id', autheticate(), controller.show);
router.post('/', autheticate(), controller.create);
router.put('/:id/addNote', autheticate(), controller.addNote);
router.put('/:id/state', autheticate(), controller.state);
router.put('/:id/facets', autheticate(), controller.facets);
router.post('/:id/unread', autheticate(), controller.unread);
router.put('/:id', autheticate(), controller.update);
router.delete('/:id', autheticate(), controller.destroy);
router.put('/:id/invoice', autheticate(), controller.invoice);
router.get('/items/damaged', autheticate(), controller.damaged);
module.exports = router;

