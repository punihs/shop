const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    order_id: '1',
    seller: 'FBSELLER',
    Arrived_date: '19/5/2018',
    weight: '1',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Your Package will be abandoned as per your request',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
