const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    name: 'manjeshpv',
    question: 'h',
    answer: 's',
    sender_name: 'punith',
    information_url: 'www.shoppre.com',

  },
  Template: {
    TemplateName,
    SubjectPart: 'Chat',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
