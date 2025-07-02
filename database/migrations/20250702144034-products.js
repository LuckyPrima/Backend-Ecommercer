"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Name is required" },
        },
      },
      shortDescription: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Short description is required" },
        },
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notNull: { msg: "Description is required" },
        },
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          notNull: { msg: "Price is required" },
        },
        min: 0,
      },
      image: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        validate: {
          notNull: { msg: "Image is required" },
        },
      },
      countInStock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Count in stock is required" },
        },
        min: 0,
      },
      color: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      size: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Category is required" },
        },
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("products");
  },
};
