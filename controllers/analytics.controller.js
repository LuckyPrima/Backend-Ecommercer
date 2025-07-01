import { Op } from "sequelize";
import { sequelize } from "../lib/db.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalyticsData = async () => {
  const totalUsers = await User.count();
  const totalProducts = await Product.count();

  const salesData = await Order.findAll({
    attributes: [
      [sequelize.fn("COUNT", sequelize.col("id")), "totalSales"],
      [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalRevenue"],
    ],
    raw: true,
  });

  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales: Number(totalSales),
    totalRevenue: Number(totalRevenue),
  };
};

export const getDailySalesData = async (startDate, endDate) => {
  try {
    console.log("DEBUG: getDailySalesData called with:");
    console.log("  startDate:", startDate.toISOString());
    console.log("  endDate:", endDate.toISOString());

    const dailySalesData = await Order.findAll({
      attributes: [
        [
          sequelize.fn("TO_CHAR", sequelize.col("createdAt"), "YYYY-MM-DD"),
          "date",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "sales"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "revenue"],
      ],
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [
        sequelize.fn("TO_CHAR", sequelize.col("createdAt"), "YYYY-MM-DD"),
      ],
      order: [
        [
          sequelize.fn("TO_CHAR", sequelize.col("createdAt"), "YYYY-MM-DD"),
          "ASC",
        ],
      ],
      raw: true,
    });

    console.log("DEBUG: Raw dailySalesData from DB:", dailySalesData);

    const dateArray = getDatesInRange(startDate, endDate);
    console.log("DEBUG: Generated dateArray:", dateArray);

    const finalDailySalesData = dateArray.map((date) => {
      const found = dailySalesData.find((item) => item.date === date);
      return {
        name: date,
        sales: found ? Number(found.sales) : 0,
        revenue: found ? Number(found.revenue) : 0,
      };
    });

    console.log(
      "DEBUG: Final formatted dailySalesData for frontend:",
      finalDailySalesData
    );
    return finalDailySalesData;
  } catch (error) {
    console.error("Error in getDailySalesData controller:", error);
    return [];
  }
};

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}