// importing all module packages
import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import chalk from "chalk";

// importing router
import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";

// chalks colors
const errorColor = chalk.bold.red;
const successColor = chalk.bold.green;
const serverColor = chalk.bold.blue;

// dotenv configuration
dotenv.config({ quiet: true });

// app/express configuration
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://inventory-management-system-1f6c.onrender.com",
      "https://inventory-management-system-theta-one.vercel.app",
    ],
    credentials: true,
  })
);

//default route
app.get("/", (req, res) => res.send("Inventory Management API is running..."));

// defining routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);

// connection variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// mongoose configuration
mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(serverColor(`Server listening to port ${PORT}...`))
    );
  })
  .catch((err) =>
    console.log(errorColor("MongoDB Connection error!!!\n"), err)
  );
