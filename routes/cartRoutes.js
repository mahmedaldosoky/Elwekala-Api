import express from "express";
import * as dotenv from "dotenv";

import Cart from "../mongodb/models/cart.js";

dotenv.config();

const app = express.Router();

// Add product to cart
app.post("/add", async (req, res) => {
  const { userId, productId, quantity } = req.body;
  const cartItem = { productId, quantity };
  const cart = await Cart.findOneAndUpdate(
    { userId },
    { $push: { products: cartItem } },
    { upsert: true, new: true }
  );
  res.json(cart);
});

// Endpoint to get all products in the cart for a given user
app.get("/", async (req, res) => {
  const { userId } = req.body;
  const cart = await Cart.findOne({ userId }).populate("products.productId");
  res.json(cart.products);
});

// Endpoint to remove a product from the cart for a given user
app.delete("/", async (req, res) => {
  const { userId, productId } = req.body;
  const cart = await Cart.findOneAndUpdate(
    { userId },
    { $pull: { products: { productId } } },
    { new: true }
  );
  res.json(cart);
});
