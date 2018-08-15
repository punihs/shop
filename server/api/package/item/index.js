
const express = require('express');
const controller = require('./item.controller');
const authenticate = require('../../../components/oauth/authenticate');

const router = express.Router();

router.get('/:packageId/items', authenticate(), controller.index);
router.post('/:packageId/items', authenticate(), controller.create);
router.put('/:packageId/items/:id/', authenticate(), controller.update);
router.delete('/:packageId/item/:id/delete', controller.destroy);
router.get(
  '/:packageId/items/:id/image',
  // authenticate(),
  controller.image,
);

module.exports = router;

