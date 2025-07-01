import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
  try {
    const userId = req.user.id;

    const coupon = await Coupon.findOne({
      where: { userId: userId, isActive: true },
      order: [["expirationDate", "DESC"]],
    });

    if (coupon && coupon.expirationDate && coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.json(null);
    }

    res.json(coupon || null);
  } catch (error) {
    console.error("Error in getCoupon controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    const coupon = await Coupon.findOne({
      where: { code: code, userId: userId, isActive: true },
    });

    if (!coupon) {
      return res
        .status(404)
        .json({ message: "Coupon not found for this user or is inactive." });
    }

    if (coupon.expirationDate && coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(400).json({ message: "Coupon expired." });
    }

    res.json({
      message: "Coupon is valid",
      id: coupon.id,
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      expirationDate: coupon.expirationDate,
    });
  } catch (error) {
    console.error("Error in validateCoupon controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
