const rp = require('request-promise');

module.exports = {
  send({ userId, msg, target }) {
    const options = {
      method: 'POST',
      headers: {
        Authorization: 'Basic NDA5OTgwMGEtMmFhMS00NzY5LWIxZTEtYjA0ODMzYmE3ZjM5',
      },

      uri: 'https://onesignal.com/api/v1/notifications',
      json: true,
      body: {
        // https://documentation.onesignal.com/v5.0/reference#section-appearance
        app_id: 'b7792635-0674-4e60-bef9-66d31b818a92',
        headings: { en: 'shoppre.com' },
        contents: { en: msg.title },
        filters: [
          {
            field: 'tag', key: 'key', relation: 'exists', value: userId,
          },
        ],
        data: {
          abc: '123',
        },
        // url which opens when user clicks on notification
        url: target.url,
      },
    };


    return rp.post(options).then(response => response)
      .catch(err => err);
  },
};
