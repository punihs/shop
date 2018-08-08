/* eslint-disable import/no-unresolved */

const express = require('express');
const controller = require('./storeCategoryClubs.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);

module.exports = router;
