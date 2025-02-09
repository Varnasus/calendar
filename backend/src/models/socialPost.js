const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SocialPost = sequelize.define('SocialPost', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    platforms: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('Backlog', 'Planned', 'In Progress', 'Done'),
      defaultValue: 'Planned'
    }
  });

  SocialPost.associate = (models) => {
    SocialPost.belongsTo(models.Campaign);
  };

  return SocialPost;
}; 