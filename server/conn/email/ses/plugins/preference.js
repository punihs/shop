const debug = require('debug');
const addressparser = require('addressparser');

const required = require;
let db;

const log = debug('q-server-conn-ses-preference');

const map = {
  ToAddresses: 'to',
  CcAddresses: 'cc',
  BccAddresses: 'bcc',
};

module.exports = async ([params, emailLog]) => {
  if (!db) db = required('../../../../conn/sqldb');
  const { User, EmailPreference, EmailTemplate } = db;
  const emailTemplate = await EmailTemplate
    .find({
      attributes: ['id'],
      where: { name: params.Template },
      raw: true,
    });

  if (!emailTemplate) return [params, emailLog];

  const emails = [];
  let Destination = { ...params.Destination };

  let firstToAddress;
  Object.keys(Destination).forEach((x) => {
    Destination = {
      ...Destination,
      [x]: Destination[x]
        .map((rawEmail) => {
          const [parsed] = addressparser(rawEmail);
          if (x === 'ToAddresses' && !firstToAddress) firstToAddress = parsed.address;
          emails.push(parsed.address);
          return parsed;
        }),
    };
  });

  const users = await User.findAll({
    attributes: ['id', 'email'],
    where: {
      email: emails,
    },
    raw: true,
  });

  const toUser = users.filter(x => (x.email === firstToAddress))[0];
  const toUserId = toUser.id || null;
  log('toUser', { toUserId, firstToAddress });

  const userIdUserMap = {};

  const blocked = await EmailPreference
    .findAll({
      attributes: ['user_id'],
      where: {
        enabled: false,
        email_template_id: emailTemplate.id,
        user_id: users.map((x) => {
          userIdUserMap[x.id] = x;
          return x.id;
        }),
      },
      raw: true,
    });

  log('preference', { blocked, params });
  if (!blocked.length) {
    return Promise.resolve([
      params,
      {
        ...emailLog,
        email_template_id: emailTemplate.id,
        user_id: toUser.id,
      }]);
  }

  const emailIdBlockedMap = blocked
    .reduce((nxt, x) => ({ ...nxt, [userIdUserMap[x.user_id].email_id]: x }), {});

  const eL = {
    ...emailLog,
    user_id: toUserId,
    email_template_id: emailTemplate.id,
  };

  Object
    .keys(params.Destination)
    .forEach((x) => {
      eL[map[x]] = JSON.stringify(params.Destination[x].join(','));

      return Object
        .assign(params.Destination, {
          [x]: Destination[x]
            .filter((emailObject) => {
              const allowed = !emailIdBlockedMap[emailObject.address];
              if (!allowed) {
                const userId = emailIdBlockedMap[emailObject.address].user_id;

                eL.terminated_ids = eL.terminated_ids
                  ? `${eL.terminated_ids},${userId}`
                  : userId;
                eL.email_template_id = emailTemplate.id;
              }
              return allowed;
            }).map(emailObject => emailObject.address),
        });
    });

  const {
    ToAddresses: toAddres = [], CcAddresses: ccAddres = [],
    BccAddresses: bccAddres = [],
  } = params.Destination;
  if (![...toAddres, ...ccAddres, ...bccAddres].length || ![...toAddres].length) {
    return Promise.reject(new Error({
      data: [params, ...eL],
      code: 400,
      message: 'terminated due to email preference',
    }));
  }

  log('preference:end', { eL });
  return Promise.resolve([params, eL]);
};
