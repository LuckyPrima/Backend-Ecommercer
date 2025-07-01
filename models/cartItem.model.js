import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const CartItem = sequelize.define("cartItem", {
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
});

CartItem.associate = (models) => {
  CartItem.belongsTo(models.User, { foreignKey: "userId", as: "user" });
  CartItem.belongsTo(models.Product, {
    foreignKey: "productId",
    as: "product",
  });
};

export default CartItem;
