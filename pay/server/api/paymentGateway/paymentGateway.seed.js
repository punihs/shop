module.exports = () => [
  {
    id: 1,
    name: 'Wire Transfer/Money Order',
    value: 'wire',
    fee: 0,
  }, {
    id: 2,
    name: 'Paper Cash',
    value: 'cash',
    fee: 0,
  }, {
    id: 3,
    name: 'Debit/Credit',
    description: '(2.5% Extra Payment Gateway Charge)',
    value: 'card',
    fee: 2.5,
  }, {
    id: 4,
    name: 'Paytm',
    description: '(3% Extra Payment Gateway Charge) - Indian PayTm/Bank Accounts Only)',
    value: 'paytm',
    fee: 3,
  }, {
    id: 5,
    name: 'Paypal',
    description: '(10% Extra Payment Gateway Charge) - International PayPal/Bank Accounts Only',
    value: 'paypal',
    fee: 10,
  }, {
    id: 6,
    name: 'Wallet',
    value: 'wallet',
    fee: 0,
  },
];
