exports.emailSubject = (data) => {
  let subject = '';
  if (data.eventKey === 'PACKAGE_ITEMS_UPLOAD_PENDING') {
    subject = 'Your Amazon Order #23311 Is Received';
  } else if (data.eventKey === 'CUSTOMER_INPUT') {
    subject = 'Please Input the Product Costs of Your Purchase';
  } else if (data.eventKey === 'READY_TO_SHIP') {
    subject = `Your Package Is Ready to be Shipped | Package ID: ${data.packageId}`;
  } else if (data.eventKey === 'DAMAGED') {
    subject = '';
  } else if (data.eventKey === 'RETURN_REQUEST_FROM_CUSTOMER') {
    subject = '';
  } else if (data.eventKey === 'RETURN_PICKUP_DONE') {
    subject = '';
  } else if (data.eventKey === 'SPLIT_PACKAGE') {
    subject = '';
  } else if (data.eventKey === 'SPLIT_PACKAGE_PROCESSED') {
    subject = '';
  } else if (data.eventKey === 'DISCARDED') {
    subject = '';
  } else if (data.eventKey === 'DISCARD_REQUESTED') {
    subject = '';
  } else if (data.eventKey === 'STANDARD_PHOTO_REQUEST') {
    subject = '';
  } else if (data.eventKey === 'ADVANCED_PHOTO_REQUEST') {
    subject = '';
  } else if (data.eventKey === 'PS_RETURN_REQUESTED') {
    subject = '';
  } else if (data.eventKey === 'PS_REFUND_RECIEVED') {
    subject = '';
  } else if (data.eventKey === 'ORDER_CREATED') {
    subject = '';
  } else if (data.eventKey === 'ORDER_CANCELLED') {
    subject = '';
  } else if (data.eventKey === 'PAYMENT_INITIATED') {
    subject = '';
  } else if (data.eventKey === 'PAYMENT_FAILED') {
    subject = '';
  } else if (data.eventKey === 'PAYMENT_COMPLETED') {
    subject = '';
  } else if (data.eventKey === 'ORDER_PLACED') {
    subject = '';
  } else if (data.eventKey === 'OUT_OF_STOCK') {
    subject = '';
  } else if (data.eventKey === 'REFUNDED_TO_WALLET') {
    subject = '';
  } else if (data.eventKey === 'REFUNDED_TO_BANK_ACCOUNT') {
    subject = '';
  } else if (data.eventKey === 'AWAITING_PACKAGE') {
    subject = '';
  }
  return subject;
};
