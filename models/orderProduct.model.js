import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const OrderProduct = sequelize.define(
  "orderProduct",
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 },
    },
  },
  {
    timestamps: false,
  }
);

export default OrderProduct;
