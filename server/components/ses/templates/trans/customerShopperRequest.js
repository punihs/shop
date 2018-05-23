const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    seller: 'Amazon.in',
    reference_number: '23499-345',
    updated_at: '22/05/2018',
    item_name: 'Dress',
    item_color: 'White',
    quantity: '5',
    price: '1000',
    total_price: '2000',
    sales_tax: '150',
    delivery_charge: '200',
    personal_shopper_cost: '300',
    sub_total: '7000',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Personal Shopper Request Submited',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
