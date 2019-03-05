const request = require('request');
const debug = require('debug');

const { updateShipmentState } = require('./../shipment/shipment.service');

const {
  SUPPORT_EMAIL_ID, SUPPORT_EMAIL_FIRST_NAME, SUPPORT_EMAIL_LAST_NAME,
} = require('../../config/environment');


const {
  SHIPMENT_STATE_IDS: { SHIPMENT_DELIVERED },
} = require('./../../config/constants');

const log = debug('s.aftership.controller');

const db = require('../../conn/sqldb');

const {
  AfterShipCarriers, Shipment,
} = db;

exports.index = async (req, res) => {
  const afterShipCarriers = await AfterShipCarriers
    .findAll({ where: { active: true } });

  res.json(afterShipCarriers);
};

exports.create = async (shipment) => {
  var options = { method: 'POST',
    url: 'https://api.aftership.com/v4/trackings',
    headers:
      { 'postman-token': '4195cc47-ca13-d48d-27a1-dc9cd0aa3a0c',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'aftership-api-key': '6cdd0364-ead7-41f8-a09e-2d4e50777ff5' },
    body:
      { tracking:
          { slug: shipment.afterShip_slug,
            tracking_number: shipment.tracking_code,
            title: shipment.Customer.first_name,
            order_id: shipment.order_code,
            order_id_path: 'www.shoppre.com',
            // custom_fields: { product_name: 'iPhone Case', product_price: 'USD19.99' },
            language: 'en' } },
    json: true };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    log(body);
    Shipment.update({ after_ship_id: body.tracking.id }, { where: { id: shipment.id } });
  });
};

exports.update = async (req, res) => {
  if (req.body) {
    const trackingId = req.body.data.tracking.id;

    const shipment = Shipment.find({
      where: { after_ship_id: trackingId },
    });

    if (shipment) {
      const opsUser = {
        first_name: SUPPORT_EMAIL_FIRST_NAME,
        last_name: SUPPORT_EMAIL_LAST_NAME,
        email: SUPPORT_EMAIL_ID,
      };

      updateShipmentState({
        nextStateId: SHIPMENT_DELIVERED,
        shipment,
        actingUser: opsUser,
        comments: 'Shipment Delivered- AfterShip',
      });
    }
  }
  res.status(200).json({ message: 'success' });
};
