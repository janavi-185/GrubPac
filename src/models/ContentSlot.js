const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ContentSlot = sequelize.define('ContentSlot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ContentSlot;
