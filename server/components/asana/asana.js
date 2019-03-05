const request = require('request');

exports.taskCreate = (name, notes, bearer, projects, workspace) => {
  const bearerCode = bearer;
  const customerName = name;
  const details = notes;

  const options = {
    method: 'POST',
    url: 'https://app.asana.com/api/1.0/tasks',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'postman-token': '3da371ea-f20d-3bde-ee75-7e6e7a107407',
      'cache-control': 'no-cache',
      authorization: `Bearer ${bearerCode}`,
    },
    form: {
      notes: details,
      projects: projects,
      name: customerName,
      workspace: workspace,
    },
  };

  request(options, (error, response, body) => {
    if (error) throw new Error(error);

    // log(body);
  });
}
