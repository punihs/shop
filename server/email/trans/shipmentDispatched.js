const getTemplate = require('../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    carrier: 'DHL',
    box_nos: '4',
    ship_request_date: '21/05/2018',
    full_name: 'Meena',
    package_value: '2500',
    package_weight: '10',
    phone: '7675919744',
    tracking_id: '68994577',
    tracking_url: 'http://www.dhl.co.in/en/express/tracking.html',
    address: 'Bangalore, Karnataka, India, 560034, koramangala,jakkasandra',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Your shipment is scheduled to ship today | Shipment ID ',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
