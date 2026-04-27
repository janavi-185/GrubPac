const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Content = require('./Content');
const ContentSlot = require('./ContentSlot');

const ContentSchedule = sequelize.define('ContentSchedule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content_id: {
    type: DataTypes.UUID,
    references: {
      model: Content,
      key: 'id',
    },
  },
  slot_id: {
    type: DataTypes.UUID,
    references: {
      model: ContentSlot,
      key: 'id',
    },
  },
  rotation_order: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    defaultValue: 5,
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

Content.hasMany(ContentSchedule, { foreignKey: 'content_id' });
ContentSchedule.belongsTo(Content, { foreignKey: 'content_id' });

ContentSlot.hasMany(ContentSchedule, { foreignKey: 'slot_id' });
ContentSchedule.belongsTo(ContentSlot, { foreignKey: 'slot_id' });

module.exports = ContentSchedule;
