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
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING',
  },
  rejection_reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: User, key: 'id' },
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  end_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

User.hasMany(Content, { foreignKey: 'uploaded_by', as: 'uploadedContent' });
Content.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

User.hasMany(Content, { foreignKey: 'approved_by', as: 'approvedContent' });
Content.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

const ContentView = require('./ContentView');
Content.hasMany(ContentView, { foreignKey: 'content_id', as: 'views' });
ContentView.belongsTo(Content, { foreignKey: 'content_id', as: 'content' });


module.exports = Content;

