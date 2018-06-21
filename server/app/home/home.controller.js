const { URLS_MYACCOUNT } = require('../../config/environment');

exports.index = (req, res) => {
  res.render('home/index', {
    URLS_MYACCOUNT,
    title: 'India&#039;s leading Shipping, Courier &amp; Package Forwarding Services for DHL &amp; Flipkart International Delivery · Shoppre',
    meta_description: 'Shoppre online international shipping company. We provide pickup anywhere from India, door-to-door delivery service and 20 Days free storage. Signup now!',
    meta_title: 'flipkart international delivery, parcel forwarding company, borderless shipping, international from india, personal shipping indian address, parcel delivery, courier services, shoppre',
  });
};
