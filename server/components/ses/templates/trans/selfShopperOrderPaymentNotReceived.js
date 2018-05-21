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
    locker: 'SHPR57-705',
    price: '2000',
    total_fee: '4000',
    url: 'hdjd',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Please submit payment to avoid rejection of incoming parcels | PS Order ID  ',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
