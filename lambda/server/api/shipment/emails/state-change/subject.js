module.exports = ({ nextStateName, shipmentDetails }) => ({
  PACKAGING_REQUESTED: `We Have Received Your Shipping Request | Shipment ${shipmentDetails.id}`,
  WRONG_ADDRESS: 'Shipment Wrong Address',
}[nextStateName]);
