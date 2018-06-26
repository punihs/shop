const getTemplate = require('../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    store_url: 'www.shoppre.com/favorite-stores',
    user_locker_action_url: 'url',
    user_refer_friend_url: 'url',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Action Needed: Please enter the value of your purchase!',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
