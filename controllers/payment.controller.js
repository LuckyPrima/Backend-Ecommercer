import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

import dotenv from "dotenv";
import OrderProduct from "../models/orderProduct.model.js";
import CartItem from "../models/cartItem.model.js";
dotenv.config();

async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });

  return coupon.id;
}

async function createNewCoupon(userId) {
  try {
    const newCoupon = await Coupon.create({
      code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      discountPercentage: 10,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userId: userId,
      isActive: true,
    });
    return newCoupon;
  } catch (error) {
    console.error("Error creating new coupon:", error);
  }
}

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    const lineItems = products.map((item) => {
      const name = item.product?.name;
      const price = parseFloat(item.product?.price);
      const quantity = parseInt(item.quantity, 10);
      const imageUrls = Array.isArray(item.product?.image)
        ? item.product.image
        : [];

      if (
        isNaN(price) ||
        isNaN(quantity) ||
        price <= 0 ||
        quantity <= 0 ||
        !name ||
        imageUrls.length === 0
      ) {
        throw new Error(
          `Invalid product data: missing name, price, quantity, or image for product ID: ${
            item.id || "Unknown"
          }`
        );
      }

      const amount = Math.round(price * 100);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: name,
            images: [imageUrls[0]],
          },
          unit_amount: amount,
        },
        quantity: quantity,
      };
    });

    let stripeCouponId = null;
    let appliedCoupon = null;

    if (couponCode) {
      appliedCoupon = await Coupon.findOne({
        where: { code: couponCode, userId: userId, isActive: true },
      });
      if (appliedCoupon) {
        stripeCouponId = await createStripeCoupon(
          appliedCoupon.discountPercentage
        );
      } else {
        console.warn(
          `Coupon code "${couponCode}" not found or invalid for user ${userId}. Proceeding without coupon.`
        );
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: stripeCouponId
        ? [
            {
              coupon: stripeCouponId,
            },
          ]
        : [],
      metadata: {
        userId: userId.toString(),
        couponCode: appliedCoupon ? appliedCoupon.code : "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p.id,
            productId: p.productId,
            quantity: p.quantity,
            price: p.product?.price,
          }))
        ),
      },
    });

    if (session.amount_total / 100 >= 200) {
      await createNewCoupon(userId);
    }

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res
      .status(500)
      .json({ message: "Error processing checkout", error: error.message });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      console.warn(
        `Checkout session ${sessionId} payment status is not 'paid': ${session.payment_status}`
      );
      return res.status(400).json({
        message: `Payment not completed. Current status: ${session.payment_status}`,
      });
    }

    // === IDEMPOTENCY CHECK ===
    const existingOrder = await Order.findOne({
      where: { stripeSessionId: sessionId },
    });

    if (existingOrder) {
      console.log(
        `Order for Stripe Session ID ${sessionId} already exists. Skipping creation.`
      );
      return res.status(200).json({
        success: true,
        message: "Order already confirmed and processed.",
        orderId: existingOrder.id,
      });
    }
    // === END IDEMPOTENCY CHECK ===

    if (session.metadata.couponCode) {
      await Coupon.update(
        { isActive: false },
        {
          where: {
            code: session.metadata.couponCode,
            userId: parseInt(session.metadata.userId),
          },
        }
      );
    }

    const products = JSON.parse(session.metadata.products);

    const newOrder = await Order.create({
      userId: parseInt(session.metadata.userId),
      totalAmount: session.amount_total / 100,
      stripeSessionId: sessionId,
    });

    for (const product of products) {
      await OrderProduct.create({
        orderId: newOrder.id,
        productId: product.productId,
        quantity: product.quantity,
        price: product.price,
      });
    }

    await CartItem.destroy({
      where: { userId: parseInt(session.metadata.userId) },
    });

    res.status(200).json({
      success: true,
      message:
        "Payment successful, order created, and coupon deactivated if used",
      orderId: newOrder.id,
    });
  } catch (error) {
    console.error("Error processing successful checkout:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Order already processed (duplicate session ID).",
        error: error.message,
      });
    }
    res.status(500).json({
      message: "Error processing successful checkout",
      error: error.message,
    });
  }
};
