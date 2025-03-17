import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
//routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();

app.use(express.json()); // it Allows you to parse the body of the request
app.use(cookieParser());


const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes)

app.listen(PORT, () => {
  console.log(`app listening on port number ${PORT}`);
  connectDB();
});
