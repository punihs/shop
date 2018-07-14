const { STATE_TYPES: { PACKAGE, SHIPMENT } } = require('../../config/constants');

const packageStates = [{
  id: 1,
  name: 'Package Items Upload Pending',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 2,
  name: 'Awaiting Verification',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 3,
  name: 'Customer Input',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 4,
  name: 'In Reveiw',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 5,
  name: 'Ready to Ship',
  config: '{"color":"success","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 6,
  name: 'Damaged',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 7,
  name: 'Return Request from Customer',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 8,
  name: 'Return Pickup Done',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 9,
  name: 'PS Return Requested',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 10,
  name: 'PS Refund Recieved',
  config: '{"color":"success","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 11,
  name: 'Split Package',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 12,
  name: 'Split Package Processed',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 13,
  name: 'Discarded',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 14,
  name: 'Added to Shipment',
  config: '{"color":"success","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 15,
  name: 'Discard Requested',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}].map(x => ({ ...x, type: PACKAGE }));

const shipmentStates = [{
  id: 16,
  // name: 'inreview',
  name: 'Packaging Requested',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 17,
  // name: 'inqueue',
  name: 'Invoice Requested',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 18,
  name: 'Payment Requested',
  // name: 'dispatched',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 19,
  name: 'Payment Initiated',
  // name: 'dispatched',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 20,
  name: 'Payment Completed',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 21,
  name: 'Payment Failed',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 22,
  name: 'Payment Confirmed',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 23,
  name: 'Upstream Shipping Request Created',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 24,
  name: 'Shipment handed Over to <Upstream> Bangalore',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 25,
  name: 'Shipment In Transit',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 26,
  name: 'Shipment Manual Followup',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 27,
  name: 'Shipment Lost',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 28,
  name: 'Custom on Hold',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 29,
  name: 'Wrong address',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 30,
  name: 'Shipment rejected by customer',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 31,
  name: 'RTO Requested',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 32,
  name: 'Raise Shipment Lost Claim',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 33,
  name: 'Penalty Payment Requested',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 34,
  name: 'Return to Origin',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 35,
  name: 'Amount Received from Upstream',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 36,
  name: 'Payment Done',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 37,
  name: 'Wrong Address Followup',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 38,
  name: 'Claim Processed to Customer',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 39,
  name: 'Customer Acknowledgement Recieved',
  config: '{"color":"info","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 40,
  name: 'Shipment delivered',
  config: '{"color":"success","state_id":"Status","comments":"Instructions and Comments"}',
}, {
  id: 41,
  name: 'Shipment Cancelled',
  config: '{"color":"danger","state_id":"Status","comments":"Instructions and Comments"}',
}].map(x => ({ ...x, type: SHIPMENT }));

module.exports = () => packageStates.concat(shipmentStates);
