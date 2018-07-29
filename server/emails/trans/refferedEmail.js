const getTemplate = require('../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    customer: 'Meena',
    friendmsg: 'I have reffered you please use my refferal code',
    code: 'SHPR456',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Your friend has referred you to SHOPPRE.com',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
