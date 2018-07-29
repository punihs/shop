const properties = require('./comment.property');

module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', properties(DataTypes), {
    tableName: 'comments',
    timestamps: true,
    paranoid: true,
    underscored: true,
  });

  Comment.associate = (db) => {
    Comment.belongsTo(db.User, {
      foreignKey: 'user_id',
    });
  };

  return Comment;
};
