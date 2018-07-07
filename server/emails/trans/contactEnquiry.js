const getTemplate = require('../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {

    first_name: 'Punith',
    last_name: 'hs',
    email: 'punith@hs.shoppre.com',
    locker_id: 'SHPR0112',
    phone: '22856',
    country: 'India',
    reason: 'testing',
    msg_content: 'hi Mr.Punith',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Contact Enquiry',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
