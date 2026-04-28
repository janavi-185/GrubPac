const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ContentView = sequelize.define('ContentView', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  teacher_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  viewed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'ContentViews',
  timestamps: false,
  indexes: [
    { fields: ['content_id'] },
    { fields: ['subject'] },
    { fields: ['teacher_id'] },
  ],
});

module.exports = ContentView;
