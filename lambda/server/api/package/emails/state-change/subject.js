module.exports = ({ nextStateName, pkg }) => ({
  PACKAGE_ITEMS_UPLOAD_PENDING: 'Your Package Has Just Arrived at Our Facility!',
  CUSTOMER_INPUT: 'Please Input the Product Costs of Your Purchase',
  READY_TO_SHIP: `Your Package Is Ready to be Shipped | Package ID: ${pkg.id}`,
  DAMAGED: 'Seems Your Item Had Arrived Here With a Damage!',
  RETURN_REQUEST_FROM_CUSTOMER: '',
  RETURN_PICKUP_DONE: '',
  SPLIT_PACKAGE: '',
  SPLIT_PACKAGE_PROCESSED: '',
  DISCARDED: '',
  DISCARD_REQUESTED: '',
  STANDARD_PHOTO_REQUEST: '',
  ADVANCED_PHOTO_REQUEST: '',
  PS_RETURN_REQUESTED: '',
  PS_REFUND_RECIEVED: '',
  ORDER_CREATED: '',
  ORDER_CANCELLED: '',
  PAYMENT_INITIATED: '',
  PAYMENT_FAILED: '',
  PAYMENT_COMPLETED: '',
  ORDER_PLACED: '',
  OUT_OF_STOCK: '',
  REFUNDED_TO_WALLET: '',
  REFUNDED_TO_BANK_ACCOUNT: '',
  AWAITING_PACKAGE: '',
}[nextStateName]);
