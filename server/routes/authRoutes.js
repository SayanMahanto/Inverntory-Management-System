// importing all packages
import express from "express";

// importing Auth controller functions
import { registerUser, loginUser } from "../controller/authController.js";

// router configuration
const router = express.Router();

// routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// testing routes
router.get("/test", (req, res) => {
  res.send("Auth route is working");
});

// exporting router
export default router;
