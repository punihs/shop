const getTemplate = require('../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    seller: 'Amazon.in',
    received: '22/05/2018',
    order_id: '546-4783',
    id: '6',
    weight: '5',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Pickup from shoppre request',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
