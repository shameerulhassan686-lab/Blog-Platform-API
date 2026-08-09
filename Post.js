// Post Model (SQL Table definition using Sequelize)
// Stores blog posts in SQLite database

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Post = sequelize.define(
  'Post',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tags: {
      type: DataTypes.JSON, // Stores tags array as JSON in SQLite
      defaultValue: [],
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Define Relationships (Association)
// A Post belongs to a User (Author)
Post.belongsTo(User, { as: 'author', foreignKey: 'userId' });
// A User has many Blog Posts
User.hasMany(Post, { foreignKey: 'userId' });

module.exports = Post;
