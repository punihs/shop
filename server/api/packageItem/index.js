const express = require('express');
const controller = require('./packageItem.controller');

const router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.get('/:id', controller.show);
router.put('/:id', controller.update);
router.put('/:id/values', controller.values);
router.delete('/:id', controller.destroy);

module.exports = router;
