// importing all packages
import express from "express";

// importing auth middleware
import { verifyToken } from "../middleware/authMiddleware.js";

// importing controllers
import { createItem } from "./../controller/itemController.js";

// router configuration
const router = express.Router();

// testing route
router.get("/test", verifyToken, (req, res) => {
  res.json({
    message: "Access granted to Inventory route",
    user: req.user,
  });
});

// routes
router.post("/", verifyToken, createItem);

export default router;
