const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    grand_total: '2000',
    created_at: '21/05/2018',
    reference_number: '537927499',
    quantity: '1',
    price: '2000',
    total_fee: '4000',
    url: 'hdjd',
    locker: 'SHPR57-705',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Please submit payment in order to receive parcels on Cash-On- Delivery | PS Order ID  ',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
