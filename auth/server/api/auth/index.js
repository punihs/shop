
const express = require('express');
const controller = require('./auth.controller');
const authenticate = require('../../components/oauth/authenticate');
const rateLimit = require('../../config/ratelimit');
const db = require('../../conn/sqldb');

const router = express.Router();

router.get('/me', authenticate(), controller.me);
router.put('/me', authenticate(), controller.update);
router.put('/:id', authenticate(), controller.update);
router.put('/:id/changePassword', authenticate(), controller.updateChangePassword);
router.get('/:id', authenticate(), controller.show);
router.put('/:id/unread', authenticate(), controller.unread);
router.delete('/:id', authenticate(), controller.destroy);
router.post('/register', rateLimit('auth', db), controller.register);
router.post('/verify', controller.verify);

module.exports = router;
