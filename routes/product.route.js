import express from "express";
import {
  createProduct,
  deleteImageProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getNewProducts,
  getProductsByCategory,
  getProductsById,
  getRecommendedProducts,
  toggleFeaturedProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/featured", getFeaturedProducts);
router.get("/new", getNewProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);

router.get("/:id", getProductsById);

router.get("/", getAllProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.put("/:id", protectRoute, adminRoute, updateProduct);
router.delete("/:id/image", protectRoute, adminRoute, deleteImageProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
