const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    order_id: '476-678-443',
    received: '21/05/2018',
    full_name: 'Meena',
    address: 'Bangalore, Karnataka, India, 560034, koramangala,jakkasandra',
    phone: '7675919744',
    weight: '10',
    seller: 'FB seller',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Your Shipment has been cancelled | Shipment ID  ',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
