
const express = require('express');
const controller = require('./address.controller');

const router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
// router.put('/:id', controller.update);
// router.delete('/:id', controller.destroy);
// router.put('/:id/default', controller.default);

module.exports = router;
