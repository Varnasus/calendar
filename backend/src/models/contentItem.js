const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ContentItem = sequelize.define('ContentItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Backlog', 'Planned', 'In Progress', 'Done'),
      defaultValue: 'Backlog'
    }
  });

  ContentItem.associate = (models) => {
    ContentItem.belongsTo(models.Campaign);
  };

  return ContentItem;
}; 