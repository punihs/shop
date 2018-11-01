const _ = require('lodash');

/**
 * Search component for searching data from sequelize models
 * @param  {SequelizeModel} model   Sequelize Model
 * @param  {String} fieldName       field to search from
 * @param  {Object} extraOptions    sequelize model options
 * @return {Function} express middleware
 */
exports.sequelize = function sequelizeSearch(model, fieldName, extraOptions) {
  const field = fieldName || 'name';
  return function seqSearch(req, res, next) {
    const options = {
      attributes: ['id', [field, 'name']],
      where: {},
      limit: Number(req.query.rows) || 10,
      offset: Number(req.query.start) || 0,
    };

    options.where[field] = { $like: `%${req.query.q ? req.query.q : ''}%` };

    // some tables may not have system_defined field
    if (model.attributes.system_defined) options.where.system_defined = 1;

    // apply extra options if providec
    if (extraOptions) _.merge(options, extraOptions);
    model.findAll(options)
      .then(items => res.json({ items }))
      .catch(next);
  };
};
