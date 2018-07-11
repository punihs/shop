const { Campaign } = require('./../../conn/sqldb');
const minio = require('./../../conn/minio');
const logger = require('./../../components/logger');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'name', 'comment', 'coupon_code', 'offer_percentage', 'starts_at', 'expires_at', 'offer_type', 'object', 'slug'],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  return Campaign
    .findAll(options)
    .then(campaign => res.json(campaign))
    .catch(next);
};

exports.create = async (req, res, next) => {
  try {
    const { campaign_file: campaignFile } = req.body;

    if (campaignFile && !['pdf', 'jpg', 'jpeg'].includes(campaignFile.filename.split('.').pop())) {
      return res.status(400).end('Invalid File');
    }

    const campaign = req.body;
    const saved = await Campaign
      .create(campaign);
    const { id } = saved;

    if (req.body.campaign_file) {
      minio
        .base64UploadCustom('campaigns', id, campaignFile)
        .then(({ object }) => saved.update({ object }))
        .catch(err => logger.error('Campaigns.express', err, req.user, req.body));
    }

    return res.status(201).json({ id });
  } catch (e) {
    return next(e);
  }
};

exports.update = (req, res, next) => {
  const { id } = req.params;
  return Campaign
    .update(req.body, { where: { id } })
    .then(({ id: Id }) => res.json({ id: Id }))
    .catch(next);
};
