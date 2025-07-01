import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";
import pg from "pg";
import bcrypt from "bcryptjs";

pg.types.setTypeParser(1114, (stringValue) => {
  return new Date(stringValue + "+0000");
});

const User = sequelize.define(
  "user",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Name is required" },
      },
      unique: {
        msg: "Name already exists",
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Email is required" },
      },
      unique: {
        msg: "Email already exists",
      },
      set(value) {
        this.setDataValue("email", value.trim().toLowerCase());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Password is required" },
      },
      len: {
        args: [8],
        msg: "Password must be at least 8 characters long",
      },
    },
    role: {
      type: DataTypes.ENUM("customer", "admin"),
      defaultValue: "customer",
    },
  },
  {
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

User.associate = (models) => {
  User.hasMany(models.CartItem, { foreignKey: "userId", as: "cartItems" });
  User.hasMany(models.Coupon, { foreignKey: "userId", as: "coupons" });
  User.hasMany(models.Order, { foreignKey: "userId", as: "orders" });
};

User.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default User;
