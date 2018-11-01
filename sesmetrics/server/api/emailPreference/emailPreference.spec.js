const debug = require('debug');
const request = require('supertest');
const assert = require('assert');

const app = require('./../../app');

const log = debug('s-api-emailPreference.controller');

const { EmailLog } = require('./.././../conn/sqldb');
const ses = require('./.././../conn/email/ses');
const logger = require('../../components/logger');

const { EmailTemplate } = require('./../../conn/sqldb');

const VIKASJSON = 1;
const VIKASJSON_EMAIL = 'support@shoppre.com';

describe('EmailPreferences', () => {
  log('EmailPreferences');
  let emailTemplate;

  before(() => EmailTemplate
    .findOrCreate({
      where: { name: 'package_state-change_1' },
      defaults: {
        group_id: 1,
        description: 'Description',
      },
    })
    .then((s) => {
      const [e] = s;

      emailTemplate = e;
    }));

  it('customer disabling a email', (done) => {
    request(app)
      .post('/api/emailPreferences?user_id=1&group_id=1')
      .send({
        email_template_id: emailTemplate.id,
        enabled: false,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        assert(Number(res.body.id), 'id is integer');
        return request(app)
          .get('/api/emailTemplates?user_id=1')
          .expect('Content-Type', /json/)
          .expect(200)
          .then(({ body: emailTemplates }) => {
            const enabled = emailTemplates
              .find(x => (x.email_template_id === emailTemplate.id));
            assert(!enabled, 'should be disabled');

            return ses
              .sendTemplatedEmailAsync({
                Source: 'support@shoppre.com',
                Destination: { ToAddresses: [VIKASJSON_EMAIL] },
                Template: 'package_state-change_1',
                TemplateData: '{"customer":{"name":"Shoprre"}}',
              })
              .then((emailResponse) => {
                assert(!!emailResponse, 'should be a object');
                assert(!!emailResponse.ResponseMetadata, 'should have ResponseMetadata');
                assert(!!emailResponse.MessageId, 'should have MessageId');
                return done();
              })
              .catch(() => EmailLog
                .count({
                  where: {
                    email_template_id: emailTemplate.id,
                    user_id: VIKASJSON,
                  },
                })
                .then((count) => {
                  assert(count, 'termination logs to be found');
                  return done();
                }));
          });
      })
      .catch(err => logger.error('emailPreference', err));
  });
});
