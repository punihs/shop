const getTemplate = require('../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    nameRest: 'Meena',
    amount: '300',
    description: '300 added in your wallet',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Check Out Your Shoppre Wallet',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
