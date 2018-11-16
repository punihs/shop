module.exports = ({ nextStateName, shipment }) => ({
  PACKAGING_REQUESTED: `We Have Received Your Shipping Request | Shipment ${shipment.id}`,
  WRONG_ADDRESS: 'Shipment Wrong Address',
}[nextStateName]);
