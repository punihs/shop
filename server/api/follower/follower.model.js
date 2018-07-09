const properties = require('./follower.property');

module.exports = (sequelize, DataTypes) => {
  const Follower = sequelize.define('Follower', properties(DataTypes), {
    tableName: 'followers',
    timestamps: true,
    underscored: true,
  });

  Follower.serializeFollowers = db => function middleware(req, res, next) {
    const adminWhere = { client_id: req.user.client_id };
    if (!adminWhere.id) adminWhere.id = req.user.id;
    return db.User.findAll({ where: adminWhere })
      .then(users =>
        Follower
          .findAll({
            where: { user_id: users.map(x => x.id) },
            attributes: ['object_id'],
            raw: true,
          })
          .then((followers) => {
            const request = req;
            request.followers = followers;
            next();
          }))
      .catch(next);
  };

  Follower.associate = (db) => {
    Follower.belongsTo(db.User, {
      foreignKey: 'user_id',
    });

    Follower.belongsTo(db.User, {
      foreignKey: 'updated_by',
      as: 'updater',
    });

    Follower.belongsTo(db.User, {
      foreignKey: 'shared_by',
      as: 'sharedBy',
    });

    Follower.belongsTo(db.Package, {
      foreignKey: 'object_id',
      constraints: false,
      as: 'package',
    });
  };

  return Follower;
};
