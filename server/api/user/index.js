
const express = require('express');
const controller = require('./user.controller');
const authenticate = require('../../components/oauth/authenticate');
const rateLimit = require('../../config/ratelimit');
const db = require('../../conn/sqldb');

const router = express.Router();

router.get('/', authenticate(), controller.index);
router.get('/me', authenticate(), controller.me);
router.get('/states', authenticate(), controller.states);
router.put('/me', authenticate(), controller.update);
router.put('/:id', authenticate(), controller.update);
router.put('/:id/changePassword', authenticate(), controller.updateChangePassword);
router.get('/:id', authenticate(), controller.show);
router.put('/:id/unread', authenticate(), controller.unread);
router.delete('/:id', authenticate(), controller.destroy);
router.post('/register', rateLimit('auth', db), controller.register);

module.exports = router;
