const debug = require('debug');

let db;
const required = require;
const log = debug('q-conn-ses-plugins-ad');

module.exports = ([params, emailLog]) => {
  log('advertisement', { params, emailLog });
  if (!db) db = required('../../../../conn/sqldb');
  return db.EmailTemplateAd
    .find({
      include: [{
        model: db.Ad,
      }, {
        model: db.EmailTemplate,
        where: {
          name: params.Template,
        },
      }],
    })
    .then((templateAd) => {
      log('templateAd', templateAd);
      if (!(templateAd && templateAd.Ad)) return Promise.resolve([params, emailLog]);

      const TemplateData = JSON.parse(params.TemplateData);

      TemplateData.ad = templateAd.Ad.html;

      const updatedParams = { ...params, TemplateData: JSON.stringify(TemplateData) };

      return [updatedParams, { ...emailLog, ad_id: templateAd.ad_id }];
    });
};

