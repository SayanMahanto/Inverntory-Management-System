// importing all packages
import express from "express";

// importing auth middleware
import { verifyToken } from "../middleware/authMiddleware.js";

// router configuration
const router = express.Router();

// routes
router.get("/test", verifyToken, (req, res) => {
  res.json({
    message: "Access granted to Inventory route",
    user: req.user,
  });
});

export default router;
