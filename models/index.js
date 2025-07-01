import User from "./user.model.js";
import CartItem from "./cartItem.model.js";
import Product from "./product.model.js";
import Coupon from "./coupon.model.js";
import Order from "./order.model.js";
import OrderProduct from "./orderProduct.model.js";

const models = {
  User,
  CartItem,
  Product,
  Coupon,
  Order,
  OrderProduct,
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

export default models;
