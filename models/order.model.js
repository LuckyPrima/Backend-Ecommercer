import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const Order = sequelize.define(
  "order",
  {
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    stripeSessionId: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    timestamps: true,
    updateTimestamp: "updateTimestamp",
  }
);

Order.associate = (models) => {
  Order.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });
  Order.belongsToMany(models.Product, {
    through: models.OrderProduct,
    foreignKey: "orderId",
    otherKey: "productId",
    as: "products",
  });
};

export default Order;
