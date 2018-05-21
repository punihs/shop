const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    sub_total: '2000',
    reference_number: '537927499',
    created_at: '21/05/2018',
    locker: 'SHPR57-705',
    item_name: 'Saree',
    item_code: '7599',
    item_size: 'M',
    item_color: 'Black',
    note: 'nothing',
    quantity: '1',
    price: '2000',
    total_price: '4000',
    promo_info: 'Nothing',
    sales_tax: '200',
    instruction: 'Nothing',
    delivery_charge: '200',
    personal_shopper_cost: '450',
    payment_gateway_fee: '200',
    promo_code: 'dgh5',
    url: 'hdjd',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Your Personal Shopper Order has been cancelled   [PS]  ',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
