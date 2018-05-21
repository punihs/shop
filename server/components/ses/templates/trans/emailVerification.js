const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    email: 'meena@shoppre.com',
    name: 'Meena',
    link: 'www.shoppre.com',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Acitvate Shoppre Account',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
