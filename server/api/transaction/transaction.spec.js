const request = require('supertest');
const assert = require('assert');
const app = require('../../app');
const { TRANSACTION_TYPES: { CREDIT, DEBIT } } = require('../../config/constants');
const { Transaction, User } = require('../../conn/sqldb');
const logger = require('../../components/logger');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');

const ABHINAV = 646;

describe('create transactions', () => {
  before(() => User.update({ wallet_balance_amount: 0 }, { where: { id: ABHINAV } }));

  it('credit from account transactions', (done) => {
    Transaction
      .create({
        customer_id: ABHINAV,
        type: CREDIT,
        amount: 50,
      })
      .then(() => User
        .findById(ABHINAV, { attributes: ['wallet_balance_amount'], raw: true })
        .then((user) => {
          assert.equal(50, user.wallet_balance_amount, 'balance should be 50');
          done();
        }))
      .catch(err => logger.error('credit', err));
  });

  after(() => User.update({ wallet_balance_amount: 0 }, { where: { id: ABHINAV } }));
});


describe('debit transactions', () => {
  before(() => User.update({ wallet_balance_amount: 50 }, { where: { id: ABHINAV } }));

  it('debit from account transactions', (done) => {
    Transaction
      .create({
        customer_id: ABHINAV,
        type: DEBIT,
        amount: 50,
      })
      .then(() => User
        .findById(ABHINAV, { attributes: ['wallet_balance_amount'], raw: true })
        .then((user) => {
          assert.equal(0, user.wallet_balance_amount, 'balance should be 50');
          done();
        }))
      .catch(err => logger.error('credit', err));
  });

  after(() => User.update({ wallet_balance_amount: 0 }, { where: { id: ABHINAV } }));
});

describe('POST /api/transactions', () => {
  it('save transactions', (done) => {
    request(app)
      .post('/api/transactions')
      .send({
        customer_id: 646,
        amount: 1000,
        type: CREDIT,
        description: 'New transaction happen',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('POST /api/transactions', () => {
  it('save transactions', (done) => {
    request(app)
      .post('/api/transactions')
      .send({
        customer_id: 646,
        amount: 1000,
        type: DEBIT,
        description: 'New transaction happen',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});


describe('GET /api/transactions', () => {
  it('return transactions', (done) => {
    request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
