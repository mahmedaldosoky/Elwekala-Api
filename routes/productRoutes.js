import express from "express";
import * as dotenv from "dotenv";

import Category from "../mongodb/models/category.js";
import Product from "../mongodb/models/product.js";
import User from "../mongodb/models/user.js";

//image imports
import cloudinary from "cloudinary";
import fs from "fs";
import { promisify } from "util";

dotenv.config();

const app = express.Router();

// configure cloudinary
cloudinary.config({
  cloud_name: "dzh2hde2n",
  api_key: "692425944689747",
  api_secret: "WPWBWEFlS8DZ3ND9oohrQQ7A9DM",
});

// helper function to promisify fs.writeFile
const writeFile = promisify(fs.writeFile);

//add product
app.post("/add", async (req, res) => {
  const {
    name,
    price,
    description,
    company,
    countInStock,
    status,
    category,
    image,
    images,
  } = req.body;

  let mainImagePath = "";
  let additionalImagePaths = [];

  try {
    //  Find category by name
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) return res.status(400).send("Invalid Category");

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({
        status: "error",
        message: "Product already exists",
        product: existingProduct,
      });
    }

    // decode base64 image data and write to file
    const mainBuffer = Buffer.from(image.split(";base64,").pop(), "base64");
    const mainFileName = `${Date.now()}-main.png`;
    const mainImagePath = `public/uploads/${mainFileName}`;
    await writeFile(mainImagePath, mainBuffer);

    //  upload main image to cloudinary
    const mainUploadedImage = await cloudinary.uploader.upload(mainImagePath, {
      folder: "product-images",
      allowedFormats: ["jpg", "png"],
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    });

    // create images array with main image URL
    const productImages = [mainUploadedImage.secure_url];

    // decode base64 image data and write to file for the additional images
    for (let i = 0; i < images.length; i++) {
      const additionalBuffer = Buffer.from(
        images[i].split(";base64,").pop(),
        "base64"
      );
      const additionalFileName = `${Date.now()}-additional-${i}.png`;
      const additionalImagePath = `public/uploads/${additionalFileName}`;
      await writeFile(additionalImagePath, additionalBuffer);

      // upload additional image to cloudinary
      const additionalUploadedImage = await cloudinary.uploader.upload(
        additionalImagePath,
        {
          folder: "product-images",
          allowedFormats: ["jpg", "png"],
          transformation: [{ width: 500, height: 500, crop: "limit" }],
        }
      );

      // add additional image URL to the images array
      productImages.push(additionalUploadedImage.secure_url);

      // add the path of the additional image to the array of additional image paths to delete them later
      additionalImagePaths.push(additionalImagePath);
    }

    // create the product object with the main and additional images
    const product = new Product({
      status,
      category,
      name,
      description,
      price,
      company,
      image: mainUploadedImage.secure_url,
      images: productImages,
      countInStock,
    });

    // save the product object to the database
    await product.save();

    // send the response with the saved product object
    res.status(200).json({
      status: "success",
      message: "Product data retrieved successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  } finally {
    // delete the uploaded file from the server
    if (mainImagePath) {
      fs.unlink(mainImagePath, (err) => {
        if (err) console.error(err);
      });
    }
  }
});

//update product

app.put("/update/:id", async (req, res) => {
  const { name, price, description, company, countInStock, status, category } =
    req.body;
  const productId = req.params.id;

  try {
    // Find product by ID
    const product = await Product.findById(productId);
    if (!product) return res.status(400).send("Invalid Product ID");

    //  Find category by name
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) return res.status(400).send("Invalid Category");

    // update product properties
    product.status = status;
    product.category = categoryDoc.name;
    product.name = name;
    product.description = description;
    product.price = price;
    product.company = company;
    product.countInStock = countInStock;

    await product.save();

    res.status(200).json({
      status: "success",
      message: "Product data updated successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

//get all products in the system

app.get("/allProducts", async (req, res) => {
  try {
    const product = await Product.find();

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

//get all products by category name
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

// get all products by company name
app.get("/", async (req, res) => {
  const { company } = req.body;
  try {
    const products = await Product.find({ company });

    if (!products) {
      return res.status(404).json({
        status: "error",
        message: "No products found for this company",
        products: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Products retrieved successfully",
      products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Server error",
      products: null,
    });
  }
});

// get one product by Id
app.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "No products found ",
        products: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Products retrieved successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Server error",
      product: null,
    });
  }
});

//delete product
app.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndRemove(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/get/search", async (req, res) => {
  try {
    const { keyword } = req.body;
    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    });
    res.status(200).json({
      status: "success",
      message:
        products.length > 0
          ? "products retrieved successfully"
          : "no products were found",
      products: products,
    });
  } catch (err) {
    console.error(err);
    res
      .status(200)
      .json({ status: "error", message: "Server error", products: null });
  }
});

app.get("/inCart/:category", async (req, res) => {
  try {
    const categoryName = req.params.category;
    const { nationalId } = req.body;

    // Find the category by name

    const category = await Category.findOne({ name: categoryName });

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Invalid Category",
      });
    }

    // Find the user by nationalId
    const user = await User.findOne({ nationalId });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Get all products in the category
    const products = await Product.find({ category: categoryName });

    // Check if each product is in the user's cart / favourite product
    const productsWithStatus = products.map((product) => {
      const inCart = user?.inCart.some(
        (cartItem) => cartItem.product.toString() === product._id.toString()
      );
      const inFavorites = user?.favoriteProducts.some(
        (favoriteProductId) =>
          favoriteProductId.toString() === product._id.toString()
      );

      return {
        ...product.toJSON(),
        inCart,
        inFavorites,
      };
    });

    res.status(200).json({
      status: "success",
      message: "Products retrieved successfully",
      products: productsWithStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

app.get("/filer/get", (req, res) => {
  const { categories, companies, minPrice, maxPrice } = req.body;

  // Create an empty filter object
  const filter = {};

  // Add categories filter if provided
  if (categories && Array.isArray(categories)) {
    filter.category = { $in: categories };
  }

  // Add companies filter if provided
  if (companies && Array.isArray(companies)) {
    filter.company = { $in: companies };
  }

  // Add price filter if provided
  if (minPrice && maxPrice) {
    filter.price = { $gte: minPrice, $lte: maxPrice };
  } else if (minPrice) {
    filter.price = { $gte: minPrice };
  } else if (maxPrice) {
    filter.price = { $lte: maxPrice };
  }

  // Use the filter object to find products in the database
  Product.find(filter)
    .populate("category", "name") // Populate the referenced category field with its name
    .then((products) => {
      res.status(200).json({
        status: "success",
        message:
          products.length > 0
            ? "products retrieved successfully"
            : "no products were found",
        products: products,
      });
    })
    .catch((err) => {
      console.error(err); // Log the error for debugging purposes
      res
        .status(200)
        .json({ error: "An error occurred while processing the request." });
    });
});

app.get("/get/top-sellers", async (req, res) => {
  const { limit } = req.body;

  try {
    // Fetch the top sellers based on sales attribute in descending order
    const topSellers = await Product.find()
      .sort({ sales: -1 }) // Sort by sales attribute in descending order
      .limit(limit); // Retrieve the top 10 sellers (you can change the limit as needed)

    // Return the top sellers as a response
    res.json({ products: topSellers });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/add/sale", async (req, res) => {
  const { productId } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Increase the sales by one
    product.sales += 1;

    // Save the updated product
    await product.save();

    return res
      .status(200)
      .json({ message: "Sales increased successfully", product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default app;
