const getTemplate = require('../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    order_id: '20',
    seller: 'FB seller',
    weight: '5',
    name: 'dhanu',
    quantity: '10',
    price: '10',
    total: '500',
    usr_ship_prefer: 'url',
    item: [{
      item: 'cloth',
      quantity: '5',
    }],
  },
  Template: {
    TemplateName,
    SubjectPart: 'Your package is in your locker | Package ID'.order_id,
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
