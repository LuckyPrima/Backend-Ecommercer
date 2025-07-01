import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const Coupon = sequelize.define(
  "coupon",
  {
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    discountPercentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    updateTimestamp: "updateTimestamp",
  }
);

Coupon.associate = (models) => {
  Coupon.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });
};

export default Coupon;
