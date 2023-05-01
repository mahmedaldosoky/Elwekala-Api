import express from "express";
import * as dotenv from "dotenv";

import Category from "../mongodb/models/category.js";
dotenv.config();

const app = express.Router();

app.get("/", async (req, res) => {
  try {
    const categoryList = await Category.find();

    if (!categoryList) {
      res.status(500).json({ success: false });
    }
    res.status(200).json({
      status: "success",
      message: "category data retrieved successfully",
      categoryList,
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", category: null });
  }
});

app.get("/:name", async (req, res) => {
  try {
    // const {name} = req.body.name;
    const category = await Category.find(req.params.name);

    if (!category) {
      res
        .status(500)
        .json({ message: "The category with the given Name was not found." });
    }
    res.status(200).json({
      status: "success",
      message: "Category data retrieved successfully",
      category,
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", category: null });
  }
});

app.post("/", async (req, res) => {
  try {
    let category = new Category({
      name: req.body.name,
    });
    category = await category.save();

    if (!category)
      return res.status(400).send("the category cannot be created!");

    res.status(200).json({
      status: "success",
      message: "Category data retrieved successfully",
      category,
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", category: null });
  }
});

app.put("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
      },
      { new: true }
    );

    if (!category)
      return res.status(400).send("the category cannot be created!");

    res.status(200).json({
      status: "success",
      message: "Category data updated successfully",
      category,
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", category: null });
  }
});

app.delete("/:id", (req, res) => {
  try {
    Category.findByIdAndRemove(req.params.id).then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "the category is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "category not found!" });
      }
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", category: null });
  }
});

export default app;
