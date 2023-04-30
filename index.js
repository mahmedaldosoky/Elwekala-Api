import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import * as dotenv from "dotenv";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import connectDB from "./mongodb/connect.js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/cart", cartRoutes);
app.use("/category", categoryRoutes);
app.use("/product", productRoutes);
app.use("/user", userRoutes);
app.use("/favorite", favoriteRoutes);

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Hello from El-Wekala!",
  });
});

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
    app.listen(8000, () =>
      console.log("Server has started on port http://localhost:8000")
    );
  } catch (error) {
    console.log(error);
  }
};

startServer();
