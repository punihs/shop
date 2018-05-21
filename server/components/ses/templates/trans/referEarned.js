const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    refMsg: 'hi',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Congratulations! You have earned Shoppre Loyalty Points',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
