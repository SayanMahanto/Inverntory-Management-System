// importing all packages
import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import chalk from "chalk";

// importing router
import authRoutes from "./routes/authRoutes.js";

// chalks colors
const errorColor = chalk.bold.red;
const successColor = chalk.bold.green;
const serverColor = chalk.bold.blue;

// dotenv configuration
dotenv.config({ quiet: true });

// app/express configuration
const app = express();
app.use(express.json());
app.use(cors());

//default route
app.get("/", (req, res) => res.send("Inventory Management API is running..."));

// defining routes
app.use("/api/auth", authRoutes);

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
