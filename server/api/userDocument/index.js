const express = require('express');

const controller = require('.//userDocument.controller');

const router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.get('/:id/download', controller.download);
router.delete('/:id', controller.destroy);

module.exports = router;

