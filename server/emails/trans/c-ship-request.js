
const getTemplate = require('../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    ship_request: {
      order_id: '2018020202',
    },
    packages: [{
      received: '2018-01-01',
      seller: 'Amazon',
      weight: '4',
      order_id: '201202020202-192',
    }],
    address: {
      name: 'Manjesh V',
      line1: 'Badanehithlu',
      line2: 'Thirthahalli',
      city: 'Shimoga',
      state: 'Karnataka',
      country: 'India',
      code: '91',
      phone: '9844717202',
    },
  },
  Template: {
    TemplateName,
    SubjectPart: 'We have received your shipment request | Shipment ID - {{ship_request.order_id}}',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
