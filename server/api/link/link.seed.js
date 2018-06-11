
module.exports = (constants) => {
  const { OBJECT_TYPE: { SHIPPING_PARTNER } } = constants;
  return [{
    name: 'Shipment Tracking',
    url: 'https://www.logistics.dhl/in-en/home/tracking.html',
    object_id: 1,
  }, {
    name: 'Parcel & Document Shipping',
    url: 'https://www.logistics.dhl/in-en/home/all-products-and-solutions/parcel-and-document-shipping.html',
    object_id: 1,
  }, {
    name: 'Facebook',
    url: 'https://www.facebook.com/dhl',
    object_id: 1,
  }, {
    name: 'Youtube',
    url: 'https://www.youtube.com/user/dhl',
    object_id: 1,
  }, {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/dhl/',
    object_id: 1,
  }, {
    name: 'Fuel Surcharge',
    url: 'http://www.dhl.co.in/en/express/shipping/shipping_advice/express_fuel_surcharge_apem.html',
    object_id: 1,
  }, {
    name: 'Surcharges for Exceptional Activities',
    url: 'http://www.dhl.co.in/en/express/shipping/shipping_advice/surcharges.html',
    object_id: 1,
  }, {
    name: 'Express Waybills – Ensure Accuracy for Fast Delivery',
    url: 'http://www.dhl.co.in/en/express/shipping/shipping_advice/waybill_guide.html',
    object_id: 1,
  }, {
    name: 'Packaging Advice',
    url: 'http://www.dhl.co.in/en/express/shipping/shipping_advice/packaging_advice.html',
    object_id: 1,
  }, {
    name: 'Dangerous Goods',
    url: 'http://www.dhl.co.in/en/express/shipping/shipping_advice/dangerous_goods.html',
    object_id: 1,
  }, {
    name: 'Lithium Batteries',
    url: 'http://www.dhl.co.in/en/express/shipping/shipping_advice/lithium_batteries.html',
    object_id: 1,
  }, {
    name: 'US FDA Regulations',
    url: 'http://www.dhl.co.in/en/express/shipping/shipping_advice/us_fda_regulations.html',
    object_id: 1,
  }, {
    name: 'Terms and Conditions',
    url: 'http://www.dhl.co.in/en/express/shipping/shipping_advice/terms_conditions.html',
    object_id: 1,
  }].map(x => ({ ...x, object_type_id: SHIPPING_PARTNER }));
};
