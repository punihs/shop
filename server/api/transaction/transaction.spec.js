const request = require('supertest');
const assert = require('assert');
const app = require('../../app');

const {
  TRANSACTION_TYPES: { CREDIT, DEBIT },
  PAYMENT_GATEWAY: {
    CARD,
  },
} = require('../../config/constants');
const {
  Transaction, User, Shipment, ShipmentState,
} = require('../../conn/sqldb');
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
          assert.equal(0, user.wallet_balance_amount, 'balance should be 0');
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

describe('GET /api/transactions/:id/complete', () => {
  let packag = '';
  let state = '';
  const ABHINAV_MISHRA = 646;
  const amount = 2220;
  let transactionId = 0;
  before(() => Promise.all([Shipment.create({
    final_amount: amount,
    payment_gateway_id: CARD,
    customer_id: ABHINAV_MISHRA,
  }).then((pack) => {
    packag = pack;
  })
    .then(() => ShipmentState
      .create({
        shipment_id: packag.id,
        state_id: 18,
        user_id: 646,
        comments: 'testing',
        status: true,
      }).then((packageState) => {
        state = packageState.id;
      }))
    .then(() => Shipment
      .update({ shipment_state_id: state }, { where: { id: packag.id } }))
    .then(() => Transaction
      .create({
        object_id: packag.id,
        payment_gateway_id: CARD,
        customer_id: ABHINAV_MISHRA,
        amount,
      }).then((transaction) => {
        transactionId = transaction.id;
      })),
  ]));
  it('response to axis payment', (done) => {
    request(app)
      .post(`/api/transactions/${transactionId}/complete`)
      .send({
        MerchantId: '13I000000000978',
        EncDataResp: 'KuSwvaaqwarEbswIHt2DhdcOLLwwoHFZzh0CSFXxZDdxPdRwszT7wfRp+tA5mOol4Q+LKimEM+mkwzHQjOsHi1A03PTyN8JpBywItIg+DnGxkM1QEhzMaJpgBxzNKnc7Zj3a9IeOd1wTUfiKka2cd6yDNPlw6DoFLSAs/4OD/vFYk0Jf9osJJx+KBmDE65feWLQKmqBCAjgn+zkWZgkuBNUX2oULTQrmMTyyfnVXuHeRWdyiFAe6iHQxAizq9dvSWMyHFugaA5JcASPtf4JkN7+KEriYAAkZV0nJ3eZGoq2G0fCfLCIGVaR416oTKBD+JYuqpJ3IUkJdhfoVwcxIGGX/fT0nsbySXwGT44j/F/MaV5V3Z4TYiENAZW26sQDxBt/+ugVqRRmOaC47P8TSun9LMzgBNzns9eHD3vknsVuYZgZIpwwF8w0HY+iFPZgmuk5BGRsPnFpuBFlt8VQpumNxi0b2blaF2O6iOvvTHSm8wqsQeUxDcWUAm3oXz/IrqBUNR0M0QoxHB85ry/9R9+j+f6i9FYmXCejvkeSgbvjE/4x7JKA7l4XgE1EkcIMknLpvH+Lx2xpRGrtn1sTmWz3QNCFKgbHGeyy/NpfdZxRpXnfol7xiDuHbkm+ZCri7eyQ0VkWDwmHJPOKjywIAQX6BQ3bbBGqdaH2HkuKfx1e+o+HKuJxcDUiiwFXFwRF+QK3ufwF5DtaudtmL1gYLeiQgsO4wnGQYosvMF7jc+KpPyRVELMD0DYNy7Yzcw46bW1RDzymdAlLXZaWYZhVYZEoL+jaeEtjhKPMsQ2k97GLX5TYRJCwrv/ghcSt7iyythQ2X+1F2jEySmP3VkoFnMlVjovWcNzcZZGHMcWHYc+Qe4XF016ROO358DTrkYdTegmnoivh5+wGYhR0d2DpzEQg4j7Qc5Lvg+x88u+HMaDhcFMUhnbMdC9geqi8Bofr+xttwcK2iQlrlGe3yJ99KKnSgT7IJbnBJdERVyujCHjW3rH5UHkAwawUUr2GkzI5fG6GVjjGfuI39XwgiIr88X9kkkHW9VXr6dg3cuooFT4t2V9BL7fD4HQK4v0UrsuZMCEXLXruZM9+uqGzBO5LysxrjWeb57fKnN8oMRPmJbRPJf5DcoKv979ZEIPRuNSzvgHTXlW0lFT54Q2QamsIi3sQpUhEy+vy5yXqYmlyjzMk=',
      })
      // todo need to check status
      .expect(302)
      .then(() => {
        done();
      });
  });
});
