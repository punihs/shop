const getTemplate = require('../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    id: '7',
    order_id: '23499-345',
    received: '22/05/2018',
    seller: 'Amazon.in',
    weight: '7',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Abandon Package Request',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
