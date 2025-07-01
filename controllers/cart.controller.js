import CartItem from "../models/cartItem.model.js";
import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await CartItem.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: "product",
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const result = cartItems.map((item) => {
      return {
        id: item.id,
        quantity: item.quantity,
        userId: item.userId,
        productId: item.productId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        product: item.product ? item.product.toJSON() : null,
      };
    });

    res.json(result);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    const existingItem = await CartItem.findOne({
      where: { userId, productId },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      await CartItem.create({
        userId,
        productId,
        quantity: quantity,
      });
    }

    const cartItems = await CartItem.findAll({
      where: { userId },
      include: { model: Product, as: "product" },
    });
    res.json(cartItems);
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedCount = await CartItem.destroy({
      where: {
        userId: userId,
      },
    });

    console.log(
      `User ${userId} cleared their entire cart. Deleted count: ${deletedCount}`
    );

    const updatedCartItems = await CartItem.findAll({
      where: { userId },
      include: [{ model: Product, as: "product" }],
      order: [["createdAt", "ASC"]],
    });

    res.json(updatedCartItems);
  } catch (error) {
    console.error("Error in removeAllFromCart controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeSingleCartItem = async (req, res) => {
  try {
    console.log("DEBUG: Entering removeSingleCartItem controller");
    const { id } = req.params;
    const userId = req.user.id;
    console.log(`DEBUG: Received ID: ${id}, User ID from req.user: ${userId}`);

    const deletedCount = await CartItem.destroy({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Cart item not found or not authorized to delete." });
    }

    const cartItems = await CartItem.findAll({
      where: { userId },
      include: {
        model: Product,
        as: "product",
      },
      order: [["createdAt", "ASC"]],
    });

    res.json(cartItems);
  } catch (error) {
    console.error("Error in removeSingleCartItem controller:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: cartItemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    const existingItem = await CartItem.findOne({
      where: {
        id: cartItemId,
        userId: userId,
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        message: "Cart item not found or not authorized to update.",
      });
    }
    if (quantity === 0) {
      await existingItem.destroy();
    } else {
      existingItem.quantity = quantity;
      await existingItem.save();
    }

    const updatedCartItems = await CartItem.findAll({
      where: { userId },
      include: { model: Product, as: "product" },
      order: [["createdAt", "ASC"]],
    });

    res.json(updatedCartItems);
  } catch (error) {
    console.log("Error in updateQuantity controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
