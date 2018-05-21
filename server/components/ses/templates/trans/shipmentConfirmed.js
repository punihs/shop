const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    order_id: '645-124-556',
    weight: '10',
    final_amount: '10111',
  },
  Template: {
    TemplateName,
    SubjectPart: 'We have received your order confirmation | Shiment ID',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
