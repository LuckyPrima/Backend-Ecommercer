import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  checkoutSuccess,
  createCheckoutSession,
} from "../controllers/payment.controller.js";

const route = express.Router();

route.post("/create-checkout-session", protectRoute, createCheckoutSession);
route.post("/checkout-success", protectRoute, checkoutSuccess);

export default route;
