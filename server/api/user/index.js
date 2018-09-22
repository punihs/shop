
const express = require('express');
const controller = require('./user.controller');
const authenticate = require('../../components/oauth/authenticate');
const rateLimit = require('../../config/ratelimit');
const db = require('../../conn/sqldb');

const router = express.Router();

router.post('/register', rateLimit('auth', db), controller.submitRegister);
router.get('/', authenticate(), controller.index);
router.get('/me', authenticate(), controller.me);
router.get('/states', authenticate(), controller.states);
router.post('/', authenticate(), controller.create);
router.put('/me', authenticate(), controller.update);
router.put('/:id', authenticate(), controller.update);
router.put('/:id/changePassword', authenticate(), controller.updateChangePassword);
router.get('/:id', authenticate(), controller.show);
router.put('/:id/unread', authenticate(), controller.unread);
router.delete('/:id', authenticate(), controller.destroy);
router.post('/register', rateLimit('auth', db), controller.submitRegister);
router.post('/verify', controller.verify);

module.exports = router;
