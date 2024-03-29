module.exports = ({ nextStateName, shipment, paymentGateway, aipexPartner }) => ({
  PACKAGING_REQUESTED: `We Have Received Your Shipping Request | Shipment ID: ${shipment.id}`,
  PAYMENT_REQUESTED: `Make Payment | Your Shipment ID: ${shipment.id} Is Packed & Weighed`,
  PAYMENT_INITIATED: 'Payment Initiated',
  PAYMENT_COMPLETED: `Payment Received! | Shipment ID: ${shipment.id}`,
  PAYMENT_FAILED: `Transaction Attempt Failed: Using your ${paymentGateway.name} | ShipmentID: ${shipment.id}`,
  PAYMENT_CONFIRMED: `Payment Confirmed! | Shipment ID: ${shipment.id}`,
  UPSTREAM_SHIPMENT_REQUEST_CREATED: `We have created a Ship Request with our Courier Partner for your ShipmentID: ${shipment.id}`,
  SHIPMENT_HANDED: `Your Package Is Scheduled to Ship Today! | ShipmentID: ${shipment.id}`,
  SHIPMENT_IN_TRANSIT: aipexPartner === false ?
    `Your ShipmentID: ${shipment.id} is in Transit to the Destination`
    : `Your ShipmentID: ${shipment.id} is in Transit to the Mumbai`,
  SHIPMENT_DELIVERED: `Shipment Delivered | Earn 150 Loyalty Points! | ShipmentID: ${shipment.id}`,
  SHIPMENT_CANCELLED: `Shipment Cancelled! | Shipment ID: ${shipment.id}`,
  WRONG_ADDRESS: 'Shipment Wrong Address',
  PAYMENT_DELAY: 'You Havent Made Payment Yet! Last 2 Days',
  PAYMENT_DELAY_EXCEEDED: 'Grace period has expired! Make payment immediately',
}[nextStateName]);
