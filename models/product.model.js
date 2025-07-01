import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const Product = sequelize.define(
  "product",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Name is required" },
      },
    },
    shortDescription: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Short description is required" },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: { msg: "Description is required" },
      },
    },

    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notNull: { msg: "Price is required" },
      },
      min: 0,
    },
    image: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      validate: {
        notNull: { msg: "Image is required" },
      },
    },
    countInStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "Count in stock is required" },
      },
      min: 0,
    },
    color: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    size: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Category is required" },
      },
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    updateTimestamp: "updateTimestamp",
  }
);

Product.associate = (models) => {
  Product.hasMany(models.CartItem, {
    foreignKey: "productId",
    as: "cartItems",
  });
  Product.belongsToMany(models.Order, {
    through: models.OrderProduct,
    foreignKey: "productId",
    otherKey: "orderId",
    as: "orders",
  });
};

export default Product;
