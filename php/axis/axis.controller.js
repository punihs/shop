const rp = require('request-promise');
const { stringify } = require('querystring');

const {
  URLS_PHP, URLS_MEMBER, URLS_API, AXIS_KEY, AXIS_MERCHANT_ID, AXIS_VPC_ACCESS_CODE,
  AXIS_SECURE_SECRET,
} = require('../../server/config/environment');

const { log } = console;

exports.init = async (req, res) => {
  log('init', req.body);
  return res.redirect(`${URLS_PHP}/axis/api.php?${stringify({
    final_amount: 300,
    payment_gateway_fee: 0,
    payment_id: 4,
    redirect_url: `${URLS_API}/api/axis/success`,
    axis_key: AXIS_KEY,
    merchant_id: AXIS_MERCHANT_ID,
    secure_secret: AXIS_SECURE_SECRET,
    vpc_access_code: AXIS_VPC_ACCESS_CODE,
  })}`);
};

const verify = (body) => {
  log('verify', body);
  return rp({
    method: 'POST',
    url: 'http://cp.shoppre.com/axis/api-success.php',
    form: body,
  });
};

exports.success = async (req, res) => {
  log('success', req.body, req.query);
  return verify(req.body)
    .then((response) => {
      log(URLS_MEMBER, { body: req.body, response });
      return res.redirect(`${URLS_MEMBER}/payment/success`);
    })
    .catch((err) => {
      log('errrrrrrr', err);
      res.status(500).json(err);
    });
};
