import express from "express";
import * as dotenv from "dotenv";

import Product from "../mongodb/models/product.js";
import User from "../mongodb/models/user.js";

dotenv.config();

const app = express.Router();

// add to user's favorite products
app.post("/", async (req, res) => {
  const { nationalId, productId } = req.body;

  try {
    const user = await User.findOne({ nationalId });
    if (!user) {
      return res
        .status(200)
        .json({ status: "failure", message: "User not found" });
    }

    if (user.favoriteProducts.includes(productId)) {
      return res
        .status(200)
        .json({ status: "failure", message: "Product already added" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(200)
        .json({ status: "failure", message: "Product not found" });
    }

    user.favoriteProducts.push(productId);
    await user.save();

    res
      .status(200)
      .json({ status: "success", message: "Product added to favorites" });
  } catch (error) {
    console.log(error);
    res.status(200).json({ status: "failure", message: "Server error" });
  }
});

// remove from favorite products
app.delete("/", async (req, res) => {
  const { nationalId, productId } = req.body;

  try {
    const user = await User.findOne({ nationalId });
    if (!user) {
      return res
        .status(200)
        .json({ status: "failure", message: "User not found" });
    }

    if (!user.favoriteProducts || !user.favoriteProducts.includes(productId)) {
      return res
        .status(200)
        .json({ status: "failure", message: "Product not found in favorites" });
    }

    user.favoriteProducts = user.favoriteProducts.filter(
      (id) => id.toString() !== productId
    );
    console.log("saccccccccccccccccccccccccccccc");
    await user.save();

    res
      .status(200)
      .json({ status: "success", message: "Product removed from favorites" });
  } catch (error) {
    console.log(error);
    res.status(200).json({ status: "failure", message: "Server error" });
  }
});

// get all user's favorite products
app.get("/", async (req, res) => {
  const { nationalId } = req.body;

  try {
    const user = await User.findOne({ nationalId });
    if (!user) {
      return res
        .status(200)
        .json({ status: "failure", message: "User not found" });
    }

    const favoriteProducts = await Product.find({
      _id: { $in: user.favoriteProducts },
    });

    res.status(200).json({ status: "success", favoriteProducts });
  } catch (error) {
    console.log(error);
    res.status(200).json({ status: "failure", message: "Server error" });
  }
});

export default app;
