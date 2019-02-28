const jwt = require('jsonwebtoken');

const { MASTER_TOKEN } = require('../../../../config/environment');

const shipment = {
  id: 9,
  order_code: 'DH6677889',
  customer_name: 'MEENA',
  address: 2,
  phone: 789890082990,
  packages_count: 5,
  final_weight: 10,
  estimated_amount: '7000',
  final_amount: '10000',
  value_amount: '10000',
  created_by: 1,
  tracking_code: '1234567H',
  tracking_url: 'www.google.com',
  shipping_carrier: 'DHL',
  dispatch_date: '2018-08-20',
  delivered_date: '2018-08-20',
};

const paymentGateway = {
  name: 'wire',
};

const OPS = {
  first_name: 'Saneel',
  last_name: 'E S',
  email: 'support@shoppre.com',
};

const packages = [{
  id: 1,
  invoice_code: 'AMZ123',
  order_code: 'PKG123',
  Store: {
    name: 'Amazon',
  },
  weight: 1,
  tracking_number: 'A123GGH',
  created_at: '2018-08-20',
}];

const address = '# 181, 2nd Cross Road, 7th Main ,1st block koramangala, marathahalli, hyderabad, karnataka, India, 560034';

const customer = {
  name: 'Mr. Abhinav Mishra',
  first_name: 'Abhinav',
  virtual_address_code: 'SHPR12-182',
  email: 'tech.shoppre@gmail.com',
};

const ENV = {
  URLS_PARCEL: 'http://parcel.shoppre.test',
  URLS_WWW: 'http://www.shoppre.test',
};

module.exports = {
  PACKAGING_REQUESTED: {
    PACKAGING_REQUESTED: true,
    packages,
    customer,
    address,
    shipment,
    actingUser: OPS,
    subject: `We Have Received Your Shipping Request | Shipment ID: ${shipment.id}`,
    ENV,
  },
  INVOICE_REQUESTED: {
    INVOICE_REQUESTED: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: '',
    shipment,
  },
  PAYMENT_REQUESTED: {
    nextStateName: 'PAYMENT_REQUESTED',
    PAYMENT_REQUESTED: true,
    packages,
    customer,
    actingUser: OPS,
    address,
    ENV,
    subject: `Make Payment | Your Shipment ID: ${shipment.id} Is Packed & Weighed`,
    shipment,
    otp: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlY2guc2hvcHByZUBnbWFpbC5jb20iLCJpYXQiOjE1NTEyODM1MzR9.Ywy0Dm8NWDP6HlO4f7tTzfLN1p_7iFrDKWCJcDeOqHk',
  },
  PAYMENT_INITIATED: {
    PAYMENT_INITIATED: true,
    packages,
    customer,
    actingUser: OPS,
    ENV,
    subject: 'Payment Initiated',
    address,
    shipment,
  },
  PAYMENT_COMPLETED: {
    PAYMENT_COMPLETED: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: `Payment Received! | Shipment ID: ${shipment.id}`,
    shipment,
    paymentGateway,
    cash: 'Cash',
  },
  PAYMENT_FAILED: {
    PAYMENT_FAILED: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: `Transaction Attempt Failed: Using your ${paymentGateway.name} | ShipmentID: ${shipment.id}`,
    shipment,
    paymentGateway,
  },
  PAYMENT_CONFIRMED: {
    PAYMENT_CONFIRMED: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: `Payment Confirmed! | Shipment ID: ${shipment.id}`,
    shipment,
    paymentGateway,
  },
  UPSTREAM_SHIPMENT_REQUEST_CREATED: {
    UPSTREAM_SHIPMENT_REQUEST_CREATED: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: `We have created a Ship Request with our Courier Partner for your ShipmentID: ${shipment.id}`,
    shipment,
  },
  SHIPMENT_HANDED: {
    SHIPMENT_HANDED: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: `Your Package Is Scheduled to Ship Today! | ShipmentID: ${shipment.id}`,
    shipment,
  },
  SHIPMENT_IN_TRANSIT: {
    SHIPMENT_IN_TRANSIT: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: `Your ShipmentID: ${shipment.id} is in Transit to the Destination`,
    shipment,
  },
  SHIPMENT_MANUAL_FOLLOW_UP: {
    SHIPMENT_MANUAL_FOLLOW_UP: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: '',
    shipment,
  },
  SHIPMENT_LOST: {
    SHIPMENT_LOST: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: '',
    shipment,
  },
  CUSTOM_ON_HOLD: {
    CUSTOM_ON_HOLD: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: '',
    shipment,
  },
  WRONG_ADDRESS: {
    WRONG_ADDRESS: true,
    nextStateName: 'WRONG_ADDRESS',
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: '',
    shipment,
  },
  SHIPMENT_REJECTED_BY_CUSTOMER: {
    SHIPMENT_REJECTED_BY_CUSTOMER: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: '',
    shipment,
  },
  RTO_REQUESTED: {
    RTO_REQUESTED: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: '',
    shipment,
  },
  RAISE_SHIPMENT_LOST_CLAIM: {
    RAISE_SHIPMENT_LOST_CLAIM: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: '',
    shipment,
  },
  PENALTY_PAYMENT_REQUESTED: {
    PENALTY_PAYMENT_REQUESTED: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: '',
    shipment,
  },
  RETURN_TO_ORIGIN: {
    RETURN_TO_ORIGIN: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: '',
    shipment,
  },
  AMOUNT_RECEIVED_FROM_UPSTREAM: {
    AMOUNT_RECEIVED_FROM_UPSTREAM: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: '',
    shipment,
  },
  PENALTY_PAYMENT_DONE: {
    PENALTY_PAYMENT_DONE: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: '',
    shipment,
  },
  WRONG_ADDRESS_FOLLOW_UP: {
    WRONG_ADDRESS_FOLLOW_UP: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: '',
    shipment,
  },
  CLAIM_PROCESSED_TO_CUSTOMER: {
    CLAIM_PROCESSED_TO_CUSTOMER: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: '',
    shipment,
  },
  CUSTOMER_ACKNOWLEDGEMENT_RECEIVED: {
    CUSTOMER_ACKNOWLEDGEMENT_RECEIVED: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: '',
    shipment,
  },
  SHIPMENT_DELIVERED: {
    SHIPMENT_DELIVERED: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: `Shipment Delivered | Earn 150 Loyalty Points! | ShipmentID: ${shipment.id}`,
    shipment,
  },
  SHIPMENT_CANCELLED: {
    SHIPMENT_CANCELLED: true,
    // otp: jwt({ email: 'manjeshpv@gmail.com' }, MASTER_TOKEN),
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: `Shipment Cancelled! | Shipment ID: ${shipment.id}`,
    shipment,
  },
  PAYMENT_DELAY: {
    PAYMENT_DELAY: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: 'You Havent Made Payment Yet! Last 2 Days',
    shipment,
    paymentDelayLimit: 7,
    paymentDelayCharge: 100,
  },
  PAYMENT_DELAY_EXCEEDED: {
    PAYMENT_DELAY_EXCEEDED: true,
    packages,
    customer,
    address,
    actingUser: OPS,
    ENV,
    subject: 'Grace period has expired! Make payment immediately',
    shipment,
    paymentDelayLimit: 7,
    paymentDelayCharge: 100,
  },
};
