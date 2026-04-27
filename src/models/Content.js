const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Content = sequelize.define('Content', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING',
  },
  uploaderId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
  },
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: true,
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

// Relationships
User.hasMany(Content, { foreignKey: 'uploaderId', as: 'uploadedContent' });
Content.belongsTo(User, { foreignKey: 'uploaderId', as: 'uploader' });

User.hasMany(Content, { foreignKey: 'approvedBy', as: 'approvedContent' });
Content.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

module.exports = Content;
