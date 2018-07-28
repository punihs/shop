
const store = 'Amazon';

module.exports = {
  oneSignal: [{
    userId: 1,
    msg: {
      title: `Your shipment x from ${store}`,
    },
  }, {
    userId: 1,
    msg: {
      title: `Your shipment not from ${store}`,
    },
  }],
};
