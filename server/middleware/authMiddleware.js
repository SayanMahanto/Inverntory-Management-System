// importing all packages
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// defining JWT secret key from .env
dotenv.config({ quiet: true });
const JWT_SECRET = process.env.JWT_SECRET;

// function to verify header
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
};
