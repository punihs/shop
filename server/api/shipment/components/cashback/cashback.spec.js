const { cashback } = require('./');

describe('GET /api/transaction/33/cashback', () => {
  it('return transactions/33/cashback', (done) => {
    cashback({
      transactionId: 41,
      object_id: '20181210144331-646',
      customer_id: 646,
    })
      .then(() => {
        done();
      });
  });
});
