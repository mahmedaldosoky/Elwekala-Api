import express from "express";
import * as dotenv from "dotenv";

import Category from "../mongodb/models/category.js";
import Product from "../mongodb/models/product.js";

dotenv.config();

const app = express.Router();

app.get("/", async (req, res) => {
  try {
    let filter = {};
    if (req.query.categories) {
      filter = { category: req.query.categories.split(",") };
    }

    const productList = await Product.find(filter).populate("category");

    if (!productList) {
      res.status(500).json({ success: false });
    }
    res.status(200).json({
      status: "success",
      message: "Category data retrieved successfully",
      productList,
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", product: null });
  }
});

app.get("/:category", async (req, res) => {
  try {
    var categoryName = req.params.category;

    Category.findOne({ name: categoryName });
    const product = await Product.find({ category: categoryName });

    if (!product) {
      res.status(500).json({ success: false });
    }

    res.status(200).json({
      status: "success",
      message: "All products data retrieved successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", product: null });
  }
});

app.post("/", async (req, res) => {
  try {
    const category = await Category.find(req.params.category);
    if (!category) return res.status(400).send("Invalid Category");

    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      company: req.body.company,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      image: req.body.image,
      quantity: req.body.quantity,
    });

    product = await product.save();

    if (!product) return res.status(500).send("The product cannot be created");

    res.status(200).json({
      status: "success",
      message: "category data retrieved successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", product: null });
  }
});

app.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("Invalid Category");

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        company: req.body.company,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        image: req.body.image,
        quantity: req.body.quantity,
      },
      { new: true }
    );

    if (!product) return res.status(500).send("the product cannot be updated!");

    res.status(200).json({
      status: "success",
      message: "Users data retrieved successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", product: null });
  }
});

app.delete("/:id", (req, res) => {
  try {
    Product.findByIdAndRemove(req.params.id).then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "the product is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not found!" });
      }
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", product: null });
  }
});

app.get(`/get/count`, async (req, res) => {
  try {
    const productCount = await Product.countDocuments((count) => count);

    if (!productCount) {
      res.status(500).json({ success: false });
    }
    res.send({
      productCount: productCount,
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", product: null });
  }
});

export default app;
