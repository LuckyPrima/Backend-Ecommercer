import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.statusCode(200).json({ message: "Hello from check route" });
});

export default router;
